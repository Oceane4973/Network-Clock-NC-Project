package config

import java.util.*

/**
 * Config utility object for loading and providing configuration properties.
 *
 * This object handles:
 * - Loading server and application properties from their respective configuration files.
 * - Providing access to various configuration parameters such as server ports, host, SSL settings, and script paths.
 *
 * Key functionalities include:
 * - Loading properties from "server.properties" and "app.properties" files.
 * - Providing getter methods for configuration parameters including server host, ports, SSL details, and script paths.
 * - Determining the user directory at runtime.
 *
 * The Config object ensures that all necessary properties are loaded and accessible for other components of the application.
 * If the properties files are not found, it throws an IllegalArgumentException.
 */
object Config {
    private val server_properties = Properties()
    private val app_properties = Properties()
    private val user_dir : String

    init {
        val severInputStream = this::class.java.classLoader.getResourceAsStream("config/server.properties")
            ?: throw IllegalArgumentException("server.properties not found")
        server_properties.load(severInputStream)

        val appInputStream = this::class.java.classLoader.getResourceAsStream("config/app.properties")
            ?: throw IllegalArgumentException("app.properties not found")
        app_properties.load(appInputStream)

        user_dir = System.getProperty("user.dir")
    }

    val serverPort: Int
        get() = server_properties.getProperty("server.port").toInt()

    val serverHost: String
        get() = server_properties.getProperty("server.host").toString()

    val serverTcpPort: Int
        get() = server_properties.getProperty("serverTCP.port").toInt()

    val keyStorePath: String
        get() = server_properties.getProperty("ssl.keystore.path", "")

    val keyStorePassword: CharArray
        get() = server_properties.getProperty("ssl.keystore.password", "").toCharArray()

    val privateKeyPassword: CharArray
        get() = server_properties.getProperty("ssl.privatekey.password", "").toCharArray()

    val keyAlias: String
        get() = server_properties.getProperty("ssl.key.alias", "")

    val setTimeScriptPath: String
        get() = "/src/main/resources/scripts/set-time.sh"

    val userName: String
        get() = app_properties.getProperty("user.name").toString()

    val userDirectory: String
        get() = user_dir

}
