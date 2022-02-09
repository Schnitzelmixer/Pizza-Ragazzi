package ModelTests;

import com.google.common.collect.ImmutableMap;
import models.LevelUp;
import models.factory.UserFactory;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import play.db.Database;
import play.db.Databases;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class TestLevelUp {

    private final int TIER_ONE = 1;
    private final int ENOUGH_FOR_TIER_TWO = 2000;
    private final int NOT_ENOUGH_FOR_TIER_TWO = 1499;
    private Database database;
    private UserFactory userFactory;
    private LevelUp levelUp;

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
        levelUp = new LevelUp(database);
    }

    @After
    public void shutdownDatabase() {
        database.shutdown();
    }

    @Test
    public void testCheckForLevelUp_whenEnoughPoints_thenPossible() {

        UserFactory.User testUser = userFactory.createUser("test@test.test", "testUser", "test");
        testUser.setCurrentTier(TIER_ONE);
        testUser.setTotalPoints(ENOUGH_FOR_TIER_TWO);

        LevelUp.LevelUpViewModel actual = levelUp.checkForLevelUp(testUser);

        testUser.delete();

        assertTrue(actual.isLevelUpPossible());
    }

    @Test
    public void testCheckForLevelUp_whenNotEnoughPoints_thenNotPossible() {

        UserFactory.User testUser = userFactory.createUser("test@test.test", "testUser", "test");
        testUser.setCurrentTier(TIER_ONE);
        testUser.setTotalPoints(NOT_ENOUGH_FOR_TIER_TWO);

        LevelUp.LevelUpViewModel actual = levelUp.checkForLevelUp(testUser);

        testUser.delete();

        assertFalse(actual.isLevelUpPossible());
    }
}
