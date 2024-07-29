#include <jni.h>
#include <iostream>
#include <sys/time.h>
#include <ctime>
#include <cstring>
#include <locale.h>
#include <time.h>

extern "C" {
    JNIEXPORT jstring JNICALL Java_system_NativeTimeManager_setSystemTime(JNIEnv *env, jobject obj, jstring timeStr) {
        setlocale(LC_TIME, "C");

        const char *time_str = env->GetStringUTFChars(timeStr, nullptr);
        struct timeval tv;
        struct tm tm;
        memset(&tm, 0, sizeof(tm));

        setenv("TZ", "Europe/Paris", 1);
        tzset();

        std::cout << "Received time string: " << time_str << std::endl;

        if (strptime(time_str, "%Y-%m-%d %H:%M:%S", &tm) == nullptr) {
            std::cerr << "Invalid time format" << std::endl;
            env->ReleaseStringUTFChars(timeStr, time_str);
            return env->NewStringUTF("Invalid time format");
        }

        tv.tv_sec = mktime(&tm) + 3600;
        tv.tv_usec = 0;

        if (settimeofday(&tv, nullptr) < 0) {
            perror("settimeofday");
            env->ReleaseStringUTFChars(timeStr, time_str);
            return env->NewStringUTF("Failed to set system time. Permission denied or invalid time.");
        }

        env->ReleaseStringUTFChars(timeStr, time_str);
        return env->NewStringUTF("System time set successfully");
    }

    JNIEXPORT jstring JNICALL Java_system_NativeTimeManager_getSystemTime(JNIEnv *env, jobject obj) {
        char time_str[20];
        struct timeval tv;
        struct tm tm;

        if (gettimeofday(&tv, nullptr) < 0) {
            perror("gettimeofday");
            return env->NewStringUTF("Error retrieving system time");
        }

        setenv("TZ", "Europe/Paris", 1);
        tzset();

        localtime_r(&tv.tv_sec, &tm);
        strftime(time_str, sizeof(time_str), "%Y-%m-%d %H:%M:%S", &tm);
        return env->NewStringUTF(time_str);
    }
}
