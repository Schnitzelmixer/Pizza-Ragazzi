package ControllerTests;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.AssetsFinder;
import controllers.LoginController;
import models.factory.UserFactory;
import org.junit.Before;
import org.junit.Test;
import play.mvc.Http;
import play.mvc.Result;
import play.test.Helpers;
import play.test.WithApplication;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;
import static play.mvc.Http.Status.OK;
import static play.test.Helpers.*;

public class LoginControllerTest extends WithApplication {

    private final String VALID_EMAIL = "test@test.com";
    private final String VALID_PASSWORD = "password";
    private AssetsFinder mockedAssetsFinder;
    private UserFactory mockedUserFactory;
    private UserFactory.User mockedUser;
    private LoginController loginController;

    @Before
    public void setUp() {
        mockedAssetsFinder = mock(AssetsFinder.class);
        mockedUserFactory = mock(UserFactory.class);
        mockedUser = mock(UserFactory.User.class);

        when(mockedUserFactory.isEmailAvailable(any())).thenReturn(false);
        when(mockedUserFactory.authenticateUser(any(), any())).thenReturn(mockedUser);
        when(mockedUser.getEmail()).thenReturn(VALID_EMAIL);

        this.loginController = new LoginController(mockedAssetsFinder, mockedUserFactory);
    }

    /*@Test
    public void testAuthenticate() {
        Http.Request fakeRequest = mock(Http.Request.class);

        Http.RequestBody mockedBody = mock(Http.RequestBody.class);

        JsonNode mockedJsonNode = mock(JsonNode.class);
        //when(mockedJsonNode.isNull()).thenReturn(false);
        when(mockedJsonNode.findPath("email").textValue()).thenReturn(VALID_EMAIL);
        when(mockedJsonNode.findPath("password").textValue()).thenReturn(VALID_PASSWORD);

        when(mockedBody.asJson()).thenReturn(mockedJsonNode);

        when(fakeRequest.body()).thenReturn(mockedBody);

        //Result result = route(app, request);
        Result result = loginController.authenticate(fakeRequest);

        System.out.println("------------------------------" + contentAsString(result));

        assertEquals(OK, result.status());
        assertEquals("application/json", result.contentType().get());
    }*/

    @Test
    public void testLogout() {
        Result result = loginController.logout();

        assertEquals(OK, result.status());
        assertEquals("text/html", result.contentType().get());
    }

    @Test
    public void testCreateAccount_whenNoRequestBody_thenBadRequest() {
        Map<String, String> testSession = new HashMap<>();
        testSession.put("username", "test");
        testSession.put("email", VALID_EMAIL);
        testSession.put("password", "test");
        testSession.put("password2", "test");

        Http.RequestBuilder requestBuilder = Helpers.fakeRequest().bodyForm(testSession);
        //Http.RequestBuilder request = Helpers.fakeRequest().method(GET).uri("/login/authenticate");

        //Result result = route(app, request);
        Result result = loginController.createAccount(requestBuilder.build());

        String actualResponse = contentAsString(result);
        String expectedResponse = "Expecting Json data";

        assertEquals(BAD_REQUEST, result.status());
        assertEquals(expectedResponse, actualResponse);
    }
}
