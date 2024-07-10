package network

import java.io.*
import java.net.ServerSocket
import java.net.Socket
import java.text.SimpleDateFormat
import java.util.*
import kotlin.concurrent.thread

class TcpServer(private val port: Int) {

    fun start() {
        val serverSocket = ServerSocket(port)
        println("Server started on port $port")

        while (true) {
            val clientSocket = serverSocket.accept()
            println("Client connected: ${clientSocket.inetAddress.hostAddress}")

            thread {
                handleClient(clientSocket)
            }
        }
    }

    private fun handleClient(clientSocket: Socket) {
        clientSocket.use {
            val input = BufferedReader(InputStreamReader(clientSocket.getInputStream()))
            val output = PrintWriter(OutputStreamWriter(clientSocket.getOutputStream()), true)

            while (true) {
                val request = input.readLine() ?: break
                val response = processRequest(request)
                output.println(response)
            }
        }
    }

    private fun processRequest(request: String): String {
        return try {
            val format = SimpleDateFormat(request)
            val currentTime = Date()
            format.format(currentTime)
        } catch (e: IllegalArgumentException) {
            "Invalid format: ${e.message}"
        }
    }
}
