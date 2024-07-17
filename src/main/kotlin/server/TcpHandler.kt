package server

import config.Config
import io.ktor.network.selector.*
import io.ktor.network.sockets.*
import io.ktor.utils.io.*
import kotlinx.coroutines.*
import system.TimeManager

class TcpHandler() : CoroutineScope {

    private val port: Int = Config.serverTcpPort
    private val job = Job()
    override val coroutineContext = Dispatchers.IO + job

    private val selectorManager = ActorSelectorManager(Dispatchers.IO)
    private var serverSocket: ServerSocket? = null

    suspend fun start() {
        serverSocket = aSocket(selectorManager).tcp().bind(port = port)
        println("TCP Server started on port $port")

        while (true) {
            val socket = serverSocket?.accept() ?: break
            println("Client connected: ${socket.remoteAddress}")

            coroutineScope {
                launch {
                    handleClient(socket)
                }
            }
        }
    }

    private suspend fun handleClient(socket: Socket) {
        val input = socket.openReadChannel()
        val output = socket.openWriteChannel(autoFlush = true)

        try {
            output.writeStringUtf8("Welcome to the Network Clock Server!\n")
            output.writeStringUtf8("Type HELP to see available commands.\n")

            while (!input.isClosedForRead) {
                val request = input.readUTF8Line() ?: break
                val response = processRequest(request)
                output.writeStringUtf8("$response\n")
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            withContext(Dispatchers.IO) {
                socket.close()
            }
        }
    }

    private fun processRequest(request: String): String {
        return when {
            request == "GET_CURRENT_TIME" -> {
                TimeManager.getCurrentTime()
            }
            request.startsWith("GET_CURRENT_TIME_FORMAT:") -> {
                val format = request.removePrefix("GET_CURRENT_TIME_FORMAT:")
                println("Requested format: $format") // Debugging line
                try {
                    val currentTime = TimeManager.getCurrentTime()
                    println("Current time: $currentTime") // Debugging line
                    TimeManager.convertDateFormat(currentTime, TimeManager.DEFAULT_FORMAT, format)
                        ?: "Invalid format: Unable to convert date"
                } catch (e: IllegalArgumentException) {
                    "Invalid format: ${e.message}"
                }
            }
            request == "HELP" -> {
                """
                Available commands:
                    GET_CURRENT_TIME - Get the current time in the default format.
                    GET_CURRENT_TIME_FORMAT:<format> - Get the current time in the specified format.
                    HELP - Show this help message.
                """.trimIndent()
            }
            else -> "Invalid request. Type HELP to see available commands."
        }
    }

    fun stop() {
        serverSocket?.close()
        serverSocket = null
        println("TCP Server stopped")
    }
}
