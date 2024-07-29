package system

import java.text.ParseException
import java.text.SimpleDateFormat
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

object TimeManager {
    private var nativeTimeManager : NativeTimeManager = NativeTimeManager()
    const val DEFAULT_FORMAT = "yyyy-MM-dd HH:mm:ss"
    private val isoFormatter = DateTimeFormatter.ISO_DATE_TIME
    private val targetFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")

    @Throws(IllegalArgumentException::class)
    fun setTime(newTime: String) {
        try {
            val parsedTime = LocalDateTime.parse(newTime, isoFormatter)
            val formattedTime = parsedTime.format(targetFormatter)

            val result: String? = nativeTimeManager.setSystemTime(formattedTime)
            require(result == "System time set successfully") { "Error setting time: $result" }
        } catch (e: Exception) {
            e.printStackTrace()
            throw IllegalArgumentException("Error setting time: ${e.message}")
        }
    }

    fun getCurrentTime(): String {
        return try {
             nativeTimeManager.getSystemTime() ?: "Error getting current time"
         } catch (e: Exception) {
            e.printStackTrace()
            "Error getting current time: ${e.message}"
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
