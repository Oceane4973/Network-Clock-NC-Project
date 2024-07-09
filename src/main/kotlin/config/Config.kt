package config

import java.util.*

object Config {
    private val properties = Properties()

    init {
        val inputStream = this::class.java.classLoader.getResourceAsStream("config/server.properties")
            ?: throw IllegalArgumentException("server.properties not found")
        properties.load(inputStream)
    }

    val serverPort: Int
        get() = properties.getProperty("server.port").toInt()
}
