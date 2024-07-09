plugins {
    kotlin("jvm") version "1.8.20"
    application
    id("org.openjfx.javafxplugin") version "0.0.13"
}

javafx {
    setVersion("20")
    setModules(listOf("javafx.controls"))
}

group = "IMT-mines-ales"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
    implementation(kotlin("stdlib"))

    implementation("org.jetbrains.kotlin:kotlin-scripting-jsr223:1.8.10")
    implementation("org.jetbrains.kotlin:kotlin-scripting-common:1.8.10")
    implementation("org.jetbrains.kotlin:kotlin-scripting-jvm:1.8.10")

    implementation("org.openjfx:javafx-controls:17")
    implementation("org.openjfx:javafx-fxml:17")

    testImplementation("org.junit.jupiter:junit-jupiter-api:5.7.1")
    testImplementation("org.junit.jupiter:junit-jupiter-engine:5.7.1")
    testImplementation("org.mockito:mockito-core:3.9.0")
}

application {
    mainClass.set("ui.App")
}

kotlin {
    jvmToolchain {
        (this as JavaToolchainSpec).languageVersion.set(JavaLanguageVersion.of(17))
    }
}

tasks.withType<JavaCompile> {
    options.release.set(17)
}

tasks.withType<ProcessResources> {
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "failed")
        showStandardStreams = true
    }
}