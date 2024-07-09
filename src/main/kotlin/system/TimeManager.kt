package system

import java.io.BufferedReader
import java.io.IOException
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.Locale

object TimeManager {
    private const val SCRIPT_PATH = "scripts/set-time.sh"
    const val DEFAULT_FORMAT = "+%Y-%m-%d %H:%M:%S"

    @Throws(IllegalArgumentException::class)
    fun setTime(newTime: String) {
        try {
            val process = ProcessBuilder("sh", SCRIPT_PATH, newTime)
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
            val process = ProcessBuilder("date", DEFAULT_FORMAT)
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
