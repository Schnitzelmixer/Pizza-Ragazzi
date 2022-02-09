package models;

import java.util.HashSet;
import java.util.List;

/**
 * The type Pizza validation.
 * It is used for validating pizzas in "Pizza-Rush" mode
 */
public class PizzaValidation {

    private int orderPoints;
    private List<Integer> orderIngredientIds;
    private List<Integer> createdPizzaIngredientIds;
    private int createdPizzaBakeStatus;

    public PizzaValidation() {
    }

    /**
     * Instantiates a new Pizza validation.
     *
     * @param orderPoints               the order points
     * @param orderIngredientIds        the order ingredient ids
     * @param createdPizzaIngredientIds the created pizza ingredient ids
     * @param createdPizzaBakeStatus    the created pizza bake status
     */
    public PizzaValidation(int orderPoints, List<Integer> orderIngredientIds, List<Integer> createdPizzaIngredientIds, int createdPizzaBakeStatus) {
        if (orderIngredientIds == null || createdPizzaIngredientIds == null)
            throw new NullPointerException("Parameter ist null");
        this.orderPoints = orderPoints;
        this.orderIngredientIds = orderIngredientIds;
        this.createdPizzaIngredientIds = createdPizzaIngredientIds;
        this.createdPizzaBakeStatus = createdPizzaBakeStatus;
    }

    /**
     * List equals.
     *
     * @param <Integer> the type parameter
     * @param list1     the list 1
     * @param list2     the list 2
     * @return the boolean
     */
    public static <Integer> boolean listEquals(List<Integer> list1, List<Integer> list2) {
        return new HashSet<>(list1).equals(new HashSet<>(list2));
    }

    /**
     * Calculates points for provided pizza.
     *
     * @return the int points
     */
    // Calculates how many points this pizza should get
    public int calculatePoints() {
        int points = orderPoints;
        if (pizzaEqualsOrder()) {
            switch (createdPizzaBakeStatus) {
                case 3: // UNBAKED
                case 5: // BURNT
                    points = (int) (points * 0.25);
                    break;
                case 4: // WELL
                    //no negative Points since its baked
                    break;
            }
        } else {
            points = 0;
        }
        return points;
    }

    /**
     * Compares the provided pizza with the order.
     *
     * @return the boolean
     */
    public boolean pizzaEqualsOrder() {
        return listEquals(createdPizzaIngredientIds, orderIngredientIds);
    }

    public int getOrderPoints() {
        return orderPoints;
    }

    public void setOrderPoints(int orderPoints) {
        this.orderPoints = orderPoints;
    }

    public List<Integer> getOrderIngredientIds() {
        return orderIngredientIds;
    }

    public void setOrderIngredientIds(List<Integer> orderIngredientIds) {
        this.orderIngredientIds = orderIngredientIds;
    }

    public List<Integer> getCreatedPizzaIngredientIds() {
        return createdPizzaIngredientIds;
    }

    public void setCreatedPizzaIngredientIds(List<Integer> createdPizzaIngredientIds) {
        this.createdPizzaIngredientIds = createdPizzaIngredientIds;
    }

    public int getCreatedPizzaBakeStatus() {
        return createdPizzaBakeStatus;
    }

    public void setCreatedPizzaBakeStatus(int createdPizzaBakeStatus) {
        this.createdPizzaBakeStatus = createdPizzaBakeStatus;
    }
}
