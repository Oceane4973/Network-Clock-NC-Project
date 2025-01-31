package system

import config.Config
import java.io.BufferedReader
import java.io.IOException
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.Locale

/**
 * TimeManager utility class for managing system time operations.
 *
 * This object provides methods to:
 * - Set the system time using a specified script.
 * - Retrieve the current system time in a default format.
 * - Convert date strings between different formats.
 *
 * Key functionalities include:
 * - Executing a script to set the system time, with error handling for various exceptions.
 * - Using system commands to get the current time, handling possible I/O and interruption issues.
 * - Converting date strings from one format to another, with appropriate error handling for parsing issues.
 *
 * Configuration parameters for script path, user directory, and user name are sourced from the Config class.
 * The default date format is defined as "yyyy-MM-dd HH:mm:ss".
 */
object TimeManager {
    private var scriptPath: String = Config.setTimeScriptPath
    private var userDirectory: String = Config.userDirectory
    private var userName : String = Config.userName
    const val DEFAULT_FORMAT = "yyyy-MM-dd HH:mm:ss"

    @Throws(IllegalArgumentException::class)
    fun setTime(newTime: String) {
        try {
            val fullScriptPath = "$userDirectory$scriptPath"
            val process = ProcessBuilder("sudo", "-u", userName, "sh", fullScriptPath, newTime)
                .redirectErrorStream(true)
                .start()
            val output = process.inputStream.bufferedReader().use(BufferedReader::readText)
            process.waitFor()
            if (process.exitValue() != 0) {
                throw IllegalArgumentException("Error setting time: $output")
            }
            println("Process exit value: ${process.exitValue()}")
            println("Process output: $output")
        } catch (e: IOException) {
            e.printStackTrace()
            throw IllegalArgumentException("I/O error while setting time: ${e.message}")
        } catch (e: InterruptedException) {
            e.printStackTrace()
            throw IllegalArgumentException("Process was interrupted while setting time: ${e.message}")
        } catch (e: Exception) {
            e.printStackTrace()
            throw IllegalArgumentException("Unexpected error while setting time: ${e.message}")
        }
    }

    fun getCurrentTime(): String {
        return try {
            val process = ProcessBuilder("date", "+%Y-%m-%d %H:%M:%S")
                .redirectErrorStream(true)
                .start()
            process.waitFor()
            val output = process.inputStream.bufferedReader().use(BufferedReader::readText)
            if (process.exitValue() != 0) {
                throw IOException("Error getting current time: $output")
            }
            output.trim()
        } catch (e: IOException) {
            e.printStackTrace()
            "Error getting current time: ${e.message}"
        } catch (e: InterruptedException) {
            e.printStackTrace()
            "Error getting current time: ${e.message}"
        } catch (e: Exception) {
            e.printStackTrace()
            "Unexpected error getting current time: ${e.message}"
        }
    }

    fun convertDateFormat(dateString: String, fromFormat: String, toFormat: String): String? {
        return try {
            val fromDateFormat = SimpleDateFormat(fromFormat, Locale.getDefault())
            val toDateFormat = SimpleDateFormat(toFormat, Locale.getDefault())
            val date = fromDateFormat.parse(dateString)
            toDateFormat.format(date)
        } catch (e: ParseException) {
            e.printStackTrace()
            null
        } catch (e: IllegalArgumentException) {
            e.printStackTrace()
            null
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
