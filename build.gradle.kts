plugins {
    kotlin("jvm") version "1.8.20"
    application
    id("com.github.node-gradle.node") version "3.0.1"
    kotlin("plugin.serialization") version "1.6.0"
}

group = "IMT-mines-ales"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5:1.8.20")
    testImplementation("io.mockk:mockk:1.12.0")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.6.4")
    testImplementation("io.ktor:ktor-server-tests:2.3.12")
    testImplementation("io.ktor:ktor-server-test-host:2.3.0")
    testImplementation("io.ktor:ktor-client-mock:2.3.0")
    testImplementation("io.ktor:ktor-client-content-negotiation:2.3.0")
    testImplementation("io.ktor:ktor-client-cio:2.3.0")

    implementation(kotlin("stdlib"))
    implementation("org.jetbrains.kotlin:kotlin-scripting-jsr223:1.8.10")
    implementation("org.jetbrains.kotlin:kotlin-scripting-common:1.8.10")
    implementation("org.jetbrains.kotlin:kotlin-scripting-jvm:1.8.10")
    implementation("io.ktor:ktor-server-core:2.3.12")
    implementation("io.ktor:ktor-server-netty:2.3.12")
    implementation("io.ktor:ktor-server-host-common:2.3.0")
    implementation("io.ktor:ktor-server-html-builder:2.3.0")
    implementation("io.ktor:ktor-server-freemarker:2.3.0")
    implementation("io.ktor:ktor-server-content-negotiation:2.3.0")
    implementation("io.ktor:ktor-server-cio:2.3.0")
    implementation("ch.qos.logback:logback-classic:1.4.12")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.0")
    implementation("io.ktor:ktor-server-cors:2.3.0")
    implementation("io.ktor:ktor-network-tls-certificates:2.3.12")
    implementation("org.jetbrains.kotlinx:kotlinx-html-jvm:0.7.5")

    testImplementation("org.junit.jupiter:junit-jupiter-api:5.7.1")
    testImplementation("org.junit.jupiter:junit-jupiter-engine:5.7.1")
    testImplementation("org.mockito:mockito-core:3.9.0")
}

application {
    mainClass.set("MainKt")
}

kotlin {
    jvmToolchain {
        (this as JavaToolchainSpec).languageVersion.set(JavaLanguageVersion.of(17))
    }
}

node {
    version.set("14.17.0")
    download.set(true)
    workDir.set(file("${project.buildDir}/nodejs"))
    nodeProjectDir.set(file("src/main/js"))
}

tasks.withType<JavaCompile> {
    options.release.set(17)
}

tasks.withType<ProcessResources> {
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}

// Tâche pour minifier et obfusquer les fichiers JS
tasks.register<com.github.gradle.node.npm.task.NpmTask>("minifyJs") {
    dependsOn("npmInstall")
    inputs.file(file("src/main/js/package.json"))
    args.set(listOf("run", "minify"))
    workingDir.set(file("src/main/js"))
}

// Vérifiez si la tâche npmInstall existe déjà avant de l'enregistrer
if (!tasks.names.contains("npmInstall")) {
    tasks.register<com.github.gradle.node.npm.task.NpmTask>("npmInstall") {
        inputs.file(file("src/main/js/package.json"))
        args.set(listOf("install"))
        workingDir.set(file("src/main/js"))
    }
}

// Vérifiez si la tâche testJs existe déjà avant de l'enregistrer
if (!tasks.names.contains("testJs")) {
    tasks.register<com.github.gradle.node.npm.task.NpmTask>("testJs") {
        dependsOn("npmInstall")
        inputs.file(file("src/main/js/package.json"))
        args.set(listOf("test"))
        workingDir.set(file("src/main/js"))
    }
}

// Ensure test task depends on testJs
tasks.named("test") {
    dependsOn("testJs")
}

tasks.named<Test>("test") {
    useJUnitPlatform()
    jvmArgs("-Xshare:off")
    // Assurez-vous que la bibliothèque native est disponible pendant les tests
    systemProperty("java.library.path", file("$buildDir/libs").absolutePath)
}

tasks.register<Exec>("runWithNative") {
    group = "application"
    description = "Run the application with the native library."
    dependsOn(tasks.named("compileKotlin"))
    dependsOn(tasks.named("compileCpp"))
    dependsOn(tasks.named("processResources"))

    val runtimeClasspath = configurations.runtimeClasspath.get().files.joinToString(":") { it.absolutePath }
    val kotlinClassesDir = file("$buildDir/classes/kotlin/main").absolutePath
    val resourcesDir = file("$buildDir/resources/main").absolutePath

    commandLine("java", "-Djava.library.path=$buildDir/libs", "-cp", "$runtimeClasspath:$kotlinClassesDir:$resourcesDir", "MainKt")
}

// Assurez-vous que les tâches run et build dépendent de minifyJs
tasks.named("processResources") {
    dependsOn("minifyJs")
}

tasks.named("run") {
    dependsOn(tasks.named("runWithNative"))
    dependsOn("minifyJs")
}

// Configuration JNI and C++ compilation

val javaHome = System.getenv("JAVA_HOME") ?: "/usr/lib/jvm/java-17-openjdk-amd64"
val includeDir = file("$javaHome/include")
val includeLinuxDir = file("$javaHome/include/linux")

tasks.register<Exec>("compileCpp") {
    group = "build"
    description = "Compile C++ code to a shared library"

    inputs.file("src/main/cpp/time_manager.cpp")
    outputs.file("$buildDir/libs/libtime_manager.so")

    commandLine = listOf(
        "g++", "-shared", "-fPIC",
        "-I$includeDir",
        "-I$includeLinuxDir",
        "src/main/cpp/time_manager.cpp",
        "-o", "$buildDir/libs/libtime_manager.so"
    )
}

tasks.register<Copy>("copySharedLibrary") {
    from("$buildDir/libs/libtime_manager.so")
    into("$buildDir/classes/kotlin/main")
    into("$buildDir/test/libs") // Ajoutez cette ligne pour copier la bibliothèque dans le répertoire de test
    dependsOn("compileCpp")
}

tasks.named("compileKotlin") {
    dependsOn("compileCpp")
    dependsOn("copySharedLibrary")
}
