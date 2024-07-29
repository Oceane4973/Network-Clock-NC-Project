#include <jni.h>
#include <iostream>
#include <sys/time.h>
#include <ctime>
#include <cstring>

extern "C" {
    JNIEXPORT void JNICALL Java_system_NativeTimeManager_setSystemTime(JNIEnv *env, jobject obj, jstring timeStr) {
        const char *time_str = env->GetStringUTFChars(timeStr, nullptr);
        struct timeval tv;
        struct tm tm;

        if (strptime(time_str, "%Y-%m-%d %H:%M:%S", &tm) == nullptr) {
            std::cerr << "Invalid time format" << std::endl;
            env->ReleaseStringUTFChars(timeStr, time_str);
            return;
        }

        tv.tv_sec = mktime(&tm);
        tv.tv_usec = 0;

        if (settimeofday(&tv, nullptr) < 0) {
            perror("settimeofday");
        }

        env->ReleaseStringUTFChars(timeStr, time_str);
    }

    JNIEXPORT jstring JNICALL Java_system_NativeTimeManager_getSystemTime(JNIEnv *env, jobject obj) {
        char time_str[20];  // Format: "YYYY-MM-DD HH:MM:SS"
        struct timeval tv;
        struct tm tm;

        if (gettimeofday(&tv, nullptr) < 0) {
            perror("gettimeofday");
            return env->NewStringUTF("Error");
        }

        localtime_r(&tv.tv_sec, &tm);
        strftime(time_str, sizeof(time_str), "%Y-%m-%d %H:%M:%S", &tm);
        return env->NewStringUTF(time_str);
    }
}
