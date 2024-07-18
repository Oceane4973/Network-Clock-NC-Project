package server

import io.ktor.network.sockets.*
import io.ktor.utils.io.*
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import system.TimeManager
import java.util.concurrent.TimeUnit
import kotlin.test.assertEquals

/**
 * Unit tests for the TcpHandler class.
 *
 * This test suite covers various functionalities of the TcpHandler class, including:
 * - Processing requests for current time and formatted time.
 * - Handling invalid formats and commands.
 * - Verifying the help command output.
 *
 * Setup and teardown methods are used to initialize and clean up mocks and objects required for testing.
 * Mockk library is utilized to mock the dependencies and control their behavior during the tests.
 * Each test is constrained by a timeout to ensure they complete within a reasonable time frame.
 */
class TcpHandlerTest {

    private lateinit var tcpHandler: TcpHandler
    private lateinit var socketMock: Socket
    private lateinit var byteReadChannelMock: ByteReadChannel
    private lateinit var byteWriteChannelMock: ByteWriteChannel

    @BeforeEach
    fun setUp() {
        tcpHandler = TcpHandler()
        socketMock = mockk(relaxed = true)
        byteReadChannelMock = mockk(relaxed = true)
        byteWriteChannelMock = mockk(relaxed = true)

        every { socketMock.openReadChannel() } returns byteReadChannelMock
        every { socketMock.openWriteChannel(true) } returns byteWriteChannelMock
    }

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }

    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    fun `testRequest GET_CURRENT_TIME`() {
        val request = "GET_CURRENT_TIME"
        val expectedResponse = "2024-07-18 12:00:00"

        mockkObject(TimeManager)
        every { TimeManager.getCurrentTime() } returns expectedResponse

        val response = tcpHandler.processRequest(request)
        assertEquals(expectedResponse, response)
    }

    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    fun `testRequest GET_CURRENT_TIME_FORMAT format invalide`() {
        val request = "GET_CURRENT_TIME_FORMAT:invalid_format"
        val expectedResponse = "Invalid format: Illegal pattern character 'i'"

        mockkObject(TimeManager)
        every { TimeManager.getCurrentTime() } returns "2024-07-18 12:00:00"
        every { TimeManager.convertDateFormat(any(), any(), any()) } throws IllegalArgumentException("Illegal pattern character 'i'")

        val response = tcpHandler.processRequest(request)
        assertEquals(expectedResponse, response)
    }

    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    fun `testRequest GET_CURRENT_TIME_FORMAT format valide`() {
        val request = "GET_CURRENT_TIME_FORMAT:yyyy-MM-dd"
        val expectedResponse = "2024-07-18"

        mockkObject(TimeManager)
        every { TimeManager.getCurrentTime() } returns "2024-07-18 12:00:00"
        every { TimeManager.convertDateFormat("2024-07-18 12:00:00", TimeManager.DEFAULT_FORMAT, "yyyy-MM-dd") } returns expectedResponse

        val response = tcpHandler.processRequest(request)
        assertEquals(expectedResponse, response)
    }

    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    fun `testRequest HELP`() {
        val request = "HELP"
        val expectedResponse = """
            Available commands:
                GET_CURRENT_TIME - Get the current time in the default format.
                GET_CURRENT_TIME_FORMAT:<format> - Get the current time in the specified format.
                HELP - Show this help message.
            """.trimIndent()

        val response = tcpHandler.processRequest(request)
        assertEquals(expectedResponse, response)
    }

    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    fun `testRequest commande invalide`() {
        val request = "INVALID_COMMAND"
        val expectedResponse = "Invalid request. Type HELP to see available commands."

        val response = tcpHandler.processRequest(request)
        assertEquals(expectedResponse, response)
    }
}
