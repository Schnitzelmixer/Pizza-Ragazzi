package ModelTests.FactoryTests;

import models.factory.MemoryFactory;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import play.db.ConnectionCallable;
import play.db.Database;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

public class MemoryFactoryTest {

    private Database mockedDatabase;
    private MemoryFactory memoryFactory;

    @Before
    public void setUp() {
        mockedDatabase = mock(Database.class);
        memoryFactory = new MemoryFactory(mockedDatabase);
    }

    @Test
    public void testGetMemoryIngredients_thenCallDatabase() {

        memoryFactory.getMemoryIngredients("email");

        verify(mockedDatabase).withConnection((ConnectionCallable<?>) Mockito.any());
    }

    @Test
    public void testGetMemoryIngredientsForNextTier_thenCallDatabase() {

        memoryFactory.getMemoryIngredients("email");

        verify(mockedDatabase).withConnection((ConnectionCallable<?>) Mockito.any());
    }
}
