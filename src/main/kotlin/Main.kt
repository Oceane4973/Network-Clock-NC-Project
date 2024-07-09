import config.Config
import network.TcpServer

fun main(args: Array<String>) {
    val port = Config.serverPort
    val server = TcpServer(port)
    server.start()
}
