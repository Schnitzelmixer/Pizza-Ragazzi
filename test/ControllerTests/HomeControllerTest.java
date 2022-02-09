package ControllerTests;

import controllers.AssetsFinder;
import controllers.HomeController;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import play.mvc.Http;
import play.mvc.Result;
import play.test.Helpers;
import play.test.WithApplication;

import static org.junit.Assert.assertEquals;
import static play.mvc.Http.Status.OK;

public class HomeControllerTest extends WithApplication {
    private HomeController homeController;

    @Before
    public void provideHomeController() {
        this.homeController = new HomeController(Mockito.mock(AssetsFinder.class));
    }

    @Test
    public void testIndex() {
        Http.RequestBuilder requestBuilder = Helpers.fakeRequest().session("email", "test");
        Result result = homeController.index(requestBuilder.build());

        assertEquals(OK, result.status());
        assertEquals("text/html", result.contentType().get());
    }

    @Test
    public void testHighscore() {
        Http.RequestBuilder requestBuilder = Helpers.fakeRequest().session("email", "test");
        Result result = homeController.highscore(requestBuilder.build());

        assertEquals(OK, result.status());
        assertEquals("text/html", result.contentType().get());
    }

    @Test
    public void testProfile() {
        Http.RequestBuilder requestBuilder = Helpers.fakeRequest().session("email", "test");
        Result result = homeController.profile(requestBuilder.build());

        assertEquals(OK, result.status());
        assertEquals("text/html", result.contentType().get());
    }

    @Test
    public void testMenu() {
        Http.RequestBuilder requestBuilder = Helpers.fakeRequest().session("email", "test");
        Result result = homeController.menu(requestBuilder.build());

        assertEquals(OK, result.status());
        assertEquals("text/html", result.contentType().get());
    }

    @Test
    public void testPizzaRush() {
        Http.RequestBuilder requestBuilder = Helpers.fakeRequest().session("email", "test");
        Result result = homeController.pizzaRush(requestBuilder.build());

        assertEquals(OK, result.status());
        assertEquals("text/html", result.contentType().get());
    }

    @Test
    public void testMemory() {
        Http.RequestBuilder requestBuilder = Helpers.fakeRequest().session("email", "test");
        Result result = homeController.memory(requestBuilder.build());

        assertEquals(OK, result.status());
        assertEquals("text/html", result.contentType().get());
    }
}