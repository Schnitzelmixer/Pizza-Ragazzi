package ModelTests.FactoryTests;

import com.google.common.collect.ImmutableMap;
import models.factory.UserFactory;
import models.factory.factoryExceptions.EmailAlreadyInUseException;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import play.db.Database;
import play.db.Databases;

import static org.junit.Assert.*;


public class UserFactoryTest {

    private Database database;
    private UserFactory userFactory;

    @Before
    public void setupDatabase() {
        database = Databases.createFrom(
                "mydatabase",
                "com.mysql.cj.jdbc.Driver",
                "jdbc:mysql://cypher.informatik.uni-wuerzburg.de:38336/sopra-2020WS-team01?useSSL=false",
                ImmutableMap.of(
                        "username", "sopra-2020WS-team01",
                        "password", "M3vfDjc8"));
        userFactory = new models.factory.UserFactory(database);
    }

    @After
    public void shutdownDatabase() {
        database.shutdown();
    }

    @Test
    public void whenCreatingUser_ThenCorrectUserAttributes() {
        UserFactory.User actualUser = userFactory.createUser("test@test.test", "testUser", "test");

        actualUser.delete();

        assertEquals("testUser", actualUser.getUsername());
        assertEquals("test@test.test", actualUser.getEmail());
        assertEquals(0, actualUser.getTotalPoints());
        assertEquals(0, actualUser.getHighScore());
        assertEquals(1, actualUser.getCurrentTier());
    }

    @Test
    public void whenCreatingUserWithSameEmail_ThenException() {
        UserFactory.User arrangeUser = userFactory.createUser("test@test.test", "testUser", "test");

        Exception exception = assertThrows(EmailAlreadyInUseException.class, () -> {
            UserFactory.User actualUser = userFactory.createUser("test@test.test", "testUser2", "test");
        });

        String expectedMessage = "The e-mail test@test.test is already in use";
        String actualMessage = exception.getMessage();
        assertEquals(expectedMessage, actualMessage);

        arrangeUser.delete();
    }

    @Test
    public void whenUnusedEmail_ThenEmailAvailable() {
        boolean actual = userFactory.isEmailAvailable("free@free.free");

        assertTrue(actual);
    }

    @Test
    public void whenUsedEmail_ThenEmailUnavailable() {
        UserFactory.User newUser = userFactory.createUser("test@test.test", "testUser", "test");

        boolean actual = userFactory.isEmailAvailable("test@test.test");

        newUser.delete();

        assertFalse(actual);
    }

    @Test
    public void whenAuthenticatingUser_ThenCorrectUserAttributes() {
        UserFactory.User arrangeUser = userFactory.createUser("test@test.test", "testUser", "test");

        UserFactory.User actualUser = userFactory.authenticateUser("test@test.test", "test");
        assertEquals("testUser", actualUser.getUsername());
        assertEquals("test@test.test", actualUser.getEmail());
        assertEquals(0, actualUser.getTotalPoints());
        assertEquals(0, actualUser.getHighScore());
        assertEquals(1, actualUser.getCurrentTier());

        arrangeUser.delete();
    }

    @Test
    public void whenAuthenticatingWrongUser_ThenNull() {
        UserFactory.User arrangeUser = userFactory.createUser("test@test.test", "testUser", "test");

        UserFactory.User actualUser = userFactory.authenticateUser("test@test.test", "wrong");

        arrangeUser.delete();

        assertNull(actualUser);
    }

    @Test
    public void whenDeletingExistingUser_ThenEmailAvailable() {
        UserFactory.User arrangeUser = userFactory.createUser("test@test.test", "testUser", "test");

        arrangeUser.delete();

        boolean actual = userFactory.isEmailAvailable("test@test.test");

        assertTrue(actual);
    }
}
