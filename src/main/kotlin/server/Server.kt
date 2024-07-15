package server

import config.Config
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.engine.*
import io.ktor.server.html.*
import io.ktor.server.http.content.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.request.*
import kotlinx.html.*
import system.TimeManager

class Server {
    private var host: String = Config.serverHost
    private var port: Int = Config.serverPort

    private val server = embeddedServer(Netty, host = host, port = port) {
        install(ContentNegotiation) {
            json()
        }
        routing {
            static("/static") {
                resources("static")
            }

            // Route for the main page
            get("/") {
                call.respondHtml {
                    head {
                        title("Network Clock Application")
                        link(rel = "stylesheet", href = "/static/style.css")
                    }
                    body {
                        div {
                            id = "clock"
                            p(classes = "date") { +"Loading date..." }
                            p(classes = "time") { +"Loading time..." }
                            div("terminal-window") {
                                section("terminal") {
                                    div("history") {}
                                    div("current-input") {
                                        +"$ "
                                        span("prompt") {
                                            attributes["contenteditable"] = "true"
                                        }
                                    }
                                }
                            }
                            p(classes = "text") { +"NETWORK CLOCK with Java & JavaScript" }
                        }
                        script(src = "/static/js/clock.min.js", type = "module") {}
                        script(src = "/static/js/commandHandler.min.js", type = "module") {}
                        script(src = "/static/js/terminal.min.js", type = "module") {}
                        script(src = "/static/js/app.min.js", type = "module") {}
                    }
                }
            }

            // API routes
            route("/api") {
                get("/getCurrentTime") {
                    val currentTime = TimeManager.getCurrentTime()
                    call.respond(mapOf("currentTime" to currentTime))
                }
                post("/setTime") {
                    val parameters = call.receiveParameters()
                    val newTime = parameters["newTime"] ?: return@post call.respond(HttpStatusCode.BadRequest, "Missing 'newTime' parameter")
                    try {
                        TimeManager.setTime(newTime)
                        call.respond(HttpStatusCode.OK, "Time updated successfully")
                    } catch (e: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, e.message ?: "Error setting time")
                    }
                }
                post("/convertDateFormat") {
                    val parameters = call.receiveParameters()
                    val dateString = parameters["dateString"] ?: return@post call.respond(HttpStatusCode.BadRequest, "Missing 'dateString' parameter")
                    val fromFormat = parameters["fromFormat"] ?: return@post call.respond(HttpStatusCode.BadRequest, "Missing 'fromFormat' parameter")
                    val toFormat = parameters["toFormat"] ?: return@post call.respond(HttpStatusCode.BadRequest, "Missing 'toFormat' parameter")
                    val convertedDate = TimeManager.convertDateFormat(dateString, fromFormat, toFormat)
                    if (convertedDate != null) {
                        call.respond(mapOf("convertedDate" to convertedDate))
                    } else {
                        call.respond(HttpStatusCode.BadRequest, "Error converting date format")
                    }
                }
            }
        }
    }

    fun start() {
        server.start(wait = true)
    }

    fun stop() {
        server.stop(1000, 10000)
    }
}
