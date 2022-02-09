package ControllerTests;

import controllers.HighscoreController;
import models.factory.UserFactory;
import org.junit.Before;
import org.junit.Test;
import play.mvc.Result;
import play.test.WithApplication;

import static org.junit.Assert.assertEquals;
import static play.mvc.Http.Status.OK;

public class HighscoreControllerTest extends WithApplication {

    private HighscoreController highscoreController;

    @Before
    public void provideHighscoreController() {
        this.highscoreController = new HighscoreController(provideApplication().injector().instanceOf(UserFactory.class));
    }

    @Test
    public void testGetTableData() {
        Result result = highscoreController.getTableData();
        assertEquals(OK, result.status());
        assertEquals("application/json", result.contentType().get());
    }
}
