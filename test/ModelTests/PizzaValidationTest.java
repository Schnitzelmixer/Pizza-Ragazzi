package ModelTests;

import models.PizzaValidation;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;


public class PizzaValidationTest {

    private final int ORDER_POINTS = 90;
    private final List<Integer> ONE_INGREDIENT_ID_LIST = new ArrayList<>();
    private final List<Integer> ANOTHER_INGREDIENT_ID_LIST = new ArrayList<>();
    private final int UNBAKED = 3;
    private final int WELL = 4;

    @Before
    public void setUp() {
        ONE_INGREDIENT_ID_LIST.add(1);
        ONE_INGREDIENT_ID_LIST.add(2);
        ONE_INGREDIENT_ID_LIST.add(3);

        ANOTHER_INGREDIENT_ID_LIST.add(1);
        ANOTHER_INGREDIENT_ID_LIST.add(3);
        ANOTHER_INGREDIENT_ID_LIST.add(4);
    }

    @Test
    public void testPizzaEqualsOrder_whenIngredientsMatch_thenTrue() {

        PizzaValidation pizzaValidation = new PizzaValidation();
        pizzaValidation.setOrderIngredientIds(ONE_INGREDIENT_ID_LIST);
        pizzaValidation.setCreatedPizzaIngredientIds(ONE_INGREDIENT_ID_LIST);

        boolean actual = pizzaValidation.pizzaEqualsOrder();

        assertTrue(actual);
    }

    @Test
    public void testPizzaEqualsOrder_whenIngredientsNotMatch_thenFalse() {

        PizzaValidation pizzaValidation = new PizzaValidation();
        pizzaValidation.setOrderIngredientIds(ONE_INGREDIENT_ID_LIST);
        pizzaValidation.setCreatedPizzaIngredientIds(ANOTHER_INGREDIENT_ID_LIST);

        boolean actual = pizzaValidation.pizzaEqualsOrder();

        assertFalse(actual);
    }

    @Test
    public void testCalculatePoints_whenPizzaCorrect_thenFullPoints() {

        PizzaValidation pizzaValidation = new PizzaValidation();
        pizzaValidation.setOrderIngredientIds(ONE_INGREDIENT_ID_LIST);
        pizzaValidation.setCreatedPizzaIngredientIds(ONE_INGREDIENT_ID_LIST);
        pizzaValidation.setOrderPoints(ORDER_POINTS);
        pizzaValidation.setCreatedPizzaBakeStatus(WELL);

        int actual = pizzaValidation.calculatePoints();

        assertEquals(ORDER_POINTS, actual);
    }

    @Test
    public void testCalculatePoints_whenOnlyNotBaked_thenQuarterPoints() {

        PizzaValidation pizzaValidation = new PizzaValidation();
        pizzaValidation.setOrderIngredientIds(ONE_INGREDIENT_ID_LIST);
        pizzaValidation.setCreatedPizzaIngredientIds(ONE_INGREDIENT_ID_LIST);
        pizzaValidation.setOrderPoints(ORDER_POINTS);
        pizzaValidation.setCreatedPizzaBakeStatus(UNBAKED);

        int actual = pizzaValidation.calculatePoints();

        assertEquals(ORDER_POINTS / 4, actual);
    }

    @Test
    public void testCalculatePoints_whenIngredientsNotMatch_thenNoPoints() {

        PizzaValidation pizzaValidation = new PizzaValidation();
        pizzaValidation.setOrderIngredientIds(ONE_INGREDIENT_ID_LIST);
        pizzaValidation.setCreatedPizzaIngredientIds(ANOTHER_INGREDIENT_ID_LIST);
        pizzaValidation.setOrderPoints(ORDER_POINTS);
        pizzaValidation.setCreatedPizzaBakeStatus(WELL);

        int actual = pizzaValidation.calculatePoints();

        assertEquals(0, actual);
    }
}
