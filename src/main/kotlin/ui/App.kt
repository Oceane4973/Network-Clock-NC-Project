package ui

import javafx.application.Application
import javafx.scene.Scene
import javafx.scene.control.Alert
import javafx.scene.control.Button
import javafx.scene.control.Label
import javafx.scene.control.TextField
import javafx.scene.layout.VBox
import javafx.stage.Stage
import system.TimeManager

class App : Application() {
    override fun start(primaryStage: Stage) {
        val label = Label("Current Time:")
        val timeField = TextField(TimeManager.getCurrentTime())
        val formatField = TextField("yyyy-MM-dd HH:mm:ss")
        val updateButton = Button("Update Time")
        val setTimeButton = Button("Set Time")

        updateButton.setOnAction {
            val currentTime = TimeManager.getCurrentTime()
            if (currentTime.contains("Error")) {
                showAlert(Alert.AlertType.ERROR, "Error", currentTime)
            } else {
                timeField.text = currentTime
            }
        }

        setTimeButton.setOnAction {
            val newTime = timeField.text
            try {
                TimeManager.setTime(newTime)
                showAlert(Alert.AlertType.INFORMATION, "Success", "Time set successfully")
            } catch (e: IllegalArgumentException) {
                showAlert(Alert.AlertType.ERROR, "Error setting time", e.message ?: "Unknown error")
            }
        }

        val vbox = VBox(10.0, label, timeField, formatField, updateButton, setTimeButton)
        val scene = Scene(vbox, 300.0, 200.0)
        primaryStage.scene = scene
        primaryStage.title = "Network Clock"
        primaryStage.show()
    }

    private fun showAlert(alertType: Alert.AlertType, title: String, message: String) {
        val alert = Alert(alertType)
        alert.title = title
        alert.contentText = message
        alert.showAndWait()
    }
}

fun main() {
    Application.launch(App::class.java)
}
