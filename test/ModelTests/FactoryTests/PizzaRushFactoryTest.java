package ModelTests.FactoryTests;

import models.factory.PizzaRushFactory;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import play.db.ConnectionCallable;
import play.db.Database;

import static org.mockito.Mockito.*;

public class PizzaRushFactoryTest {

    private Database mockedDatabase;
    private PizzaRushFactory pizzaRushFactory;

    @Before
    public void setUp() {
        mockedDatabase = Mockito.mock(Database.class);
        pizzaRushFactory = new PizzaRushFactory(mockedDatabase);
    }

    @Test
    public void testGetIngredients_thenGetSpecificIngredients() {

        PizzaRushFactory mock = mock(PizzaRushFactory.class);
        doCallRealMethod().when(mock).getIngredients();

        mock.getIngredients();

        verify(mock).getChoppingIngredients();
        verify(mock).getStampingIngredients();
    }

    @Test
    public void testGetChoppingIngredients_thenCallDatabase() {

        pizzaRushFactory.getChoppingIngredients();

        verify(mockedDatabase).withConnection((ConnectionCallable<?>) any());
    }

    @Test
    public void testGetStampingIngredients_thenCallDatabase() {

        pizzaRushFactory.getStampingIngredients();

        verify(mockedDatabase).withConnection((ConnectionCallable<?>) Mockito.any());
    }

    @Test
    public void testGetPizzas_thenCallDatabase() {

        pizzaRushFactory.getPizzas();

        verify(mockedDatabase).withConnection((ConnectionCallable<?>) Mockito.any());
    }
}
