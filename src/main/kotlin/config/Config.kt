package config

import java.util.*

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

    val keyStorePath: String
        get() = server_properties.getProperty("ssl.keystore.path", "")

    val keyStorePassword: CharArray
        get() = server_properties.getProperty("ssl.keystore.password", "").toCharArray()

    val privateKeyPassword: CharArray
        get() = server_properties.getProperty("ssl.privatekey.password", "").toCharArray()

    val keyAlias: String
        get() = server_properties.getProperty("ssl.key.alias", "")

    val setTimeScriptPath: String
        get() = app_properties.getProperty("script.path").toString()

    val userName: String
        get() = app_properties.getProperty("user.name").toString()

    val userDirectory: String
        get() = user_dir

}
