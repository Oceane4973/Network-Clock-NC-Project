package system

class NativeTimeManager {
    init {
        System.loadLibrary("time_manager")
    }

    external fun setSystemTime(newTime: String)
    external fun getSystemTime(): String
}
