package system

import config.Config
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.Locale

object TimeManager {
    private var userDirectory: String = Config.userDirectory
    private var userName: String = Config.userName
    private var nativeTimeManager : NativeTimeManager = NativeTimeManager()
    const val DEFAULT_FORMAT = "yyyy-MM-dd HH:mm:ss"

    @Throws(IllegalArgumentException::class)
    fun setTime(newTime: String) {
        try {
            nativeTimeManager.setSystemTime(newTime)
        } catch (e: Exception) {
            e.printStackTrace()
            throw IllegalArgumentException("Error setting time: ${e.message}")
        }
    }

    fun getCurrentTime(): String {
        return try {
            nativeTimeManager.getSystemTime()
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
