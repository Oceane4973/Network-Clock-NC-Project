package system

class NativeTimeManager {
    init {
        System.loadLibrary("time_manager")
    }

    external fun setSystemTime(timeStr: String?): String?
    external fun getSystemTime(): String?
}
