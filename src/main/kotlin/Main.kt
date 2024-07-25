import server.Server
import server.TcpHandler
import kotlinx.coroutines.*
import java.net.InetSocketAddress
import java.net.ServerSocket

fun main() = runBlocking {
    val server = Server()
    val serverTCP = TcpHandler()

    val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    val ktorJob = scope.launch {
        if (isPortAvailable(host = server.serverHost, port = server.serverPort)) {
            server.start()
        } else {
            println("Port ${server.serverPort} est déjà utilisé pour Ktor.")
        }
    }

    val tcpJob = scope.launch {
        if (isPortAvailable(port = serverTCP.port)) {
            serverTCP.start()
        } else {
            println("Port ${serverTCP.port} est déjà utilisé pour TCP.")
        }
    }

    Runtime.getRuntime().addShutdownHook(Thread {
        runBlocking {
            server.stop()
            serverTCP.stop()
            ktorJob.cancelAndJoin()
            tcpJob.cancelAndJoin()
        }
    })

    try {
        ktorJob.join()
        tcpJob.join()
    } catch (e: CancellationException) {
        println("Serveurs annulés : ${e.message}")
    } catch (e: Exception) {
        println("Erreur lors de l'exécution des serveurs : ${e.message}")
    }
}

private fun isPortAvailable(host: String? = null, port: Int): Boolean {
    return try {
        if (host != null) {
            ServerSocket().use { socket ->
                socket.bind(InetSocketAddress(host, port))
            }
        } else {
            ServerSocket().use { socket ->
                socket.bind(InetSocketAddress(port))
            }
        }
        true
    } catch (e: Exception) {
        false
    }
}
