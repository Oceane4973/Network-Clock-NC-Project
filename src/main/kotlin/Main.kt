import server.Server
import server.TcpHandler
import kotlinx.coroutines.*

@OptIn(DelicateCoroutinesApi::class)
fun main() {
    val server = Server()
    val serverTCP = TcpHandler()

    val ktorJob = GlobalScope.launch {
        server.start()
    }
    val tcpJob = GlobalScope.launch {
        serverTCP.start()
    }

    Runtime.getRuntime().addShutdownHook(Thread {
        runBlocking {
            server.stop()
            serverTCP.stop()
            ktorJob.cancelAndJoin()
            tcpJob.cancelAndJoin()
        }
    })

    runBlocking {
        try {
            ktorJob.join()
            tcpJob.join()
        } catch (e: CancellationException) {
            println("Servers cancelled: ${e.message}")
        } catch (e: Exception) {
            println("Error running servers: ${e.message}")
        }
    }
}