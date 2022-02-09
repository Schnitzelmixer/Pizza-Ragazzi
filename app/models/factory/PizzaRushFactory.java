package models.factory;

import models.factory.factoryExceptions.ProfilePictureException;
import play.db.Database;

import javax.imageio.ImageIO;
import javax.inject.Inject;
import javax.inject.Singleton;
import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;

/**
 * The type Pizza rush factory.
 */
@Singleton
public class PizzaRushFactory {
    final Database db;

    /**
     * Instantiates a new Pizza rush factory.
     *
     * @param db the db
     */
    @Inject
    public PizzaRushFactory(Database db) {
        this.db = db;
    }

    /**
     * Encode image to string string.
     *
     * @param image the image
     * @param type  the type
     * @return the string
     */
    public static String encodeImageToString(BufferedImage image, String type) {
        String imageString = null;
        ByteArrayOutputStream bos = new ByteArrayOutputStream();

        try {
            ImageIO.write(image, type, bos);
            byte[] imageBytes = bos.toByteArray();

            imageString = "data:image/" + type + ";base64," + Base64.getEncoder().encodeToString(imageBytes);

            bos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return imageString;
    }

    /**
     * Gets ingredient by id.
     *
     * @param id the id
     * @return the ingredient
     */
    // WARNING: Returns non-specified Ingredients (Ingredient.class)
    public Ingredient getIngredientById(int id) {
        return db.withConnection(conn -> {
            Ingredient ingredient = null;
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM `Ingredient` WHERE idIngredient = ?");
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                ingredient = new Ingredient(rs);
            }
            stmt.close();
            return ingredient;
        });
    }

    /**
     * Gets all ingredients.
     *
     * @return the ingredient-List
     */
    // Gets ALL Ingredients
    public List<Ingredient> getIngredients() {
        List<Ingredient> result = new ArrayList<>();

        result.addAll(getChoppingIngredients());
        result.addAll(getStampingIngredients());

        result.sort(Comparator.comparing(Ingredient::getId));

        return result;
    }

    /**
     * Gets ingredients for specific user.
     *
     * @param email the email of the user
     * @return the ingredient-List
     */
    // Gets available ingredients for specific User
    public List<Ingredient> getIngredients(String email) {
        List<Ingredient> result = new ArrayList<>();
        result.addAll(getChoppingIngredients(email));
        result.addAll(getStampingIngredients(email));

        result.sort(Comparator.comparing(Ingredient::getId));
        return result;
    }

    /**
     * Gets all Chopping-ingredients.
     *
     * @return the ingredient-List
     */
    public List<Ingredient> getChoppingIngredients() {
        return db.withConnection(conn -> {
            List<Ingredient> result = new ArrayList<>();
            String sql = "SELECT * FROM `Ingredient` JOIN `FlightBehavior` FB on Ingredient.idIngredient = FB.Ingredient_fk";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Ingredient ingredient = new ChoppingIngredient(rs);
                result.add(ingredient);
            }
            stmt.close();
            return result;
        });
    }

    /**
     * Gets Chopping-ingredients for specific user.
     *
     * @return the ingredient-List
     */
    private List<Ingredient> getChoppingIngredients(String email) {
        return db.withConnection(conn -> {
            List<Ingredient> result = new ArrayList<>();
            //String sql = "SELECT * FROM `Ingredient` JOIN `FlightBehavior` ON `Ingredient`.idIngredient = `FlightBehavior`.Ingredient_fk JOIN `User` ON `Ingredient`.Tier_idTier <= `User`.Tier_idTier WHERE `User`.email = ?";
            String sql = "SELECT * FROM `Ingredient` JOIN `FlightBehavior` FB on Ingredient.idIngredient = FB.Ingredient_fk WHERE Tier_idTier <= (SELECT Tier_idTier FROM `User` WHERE email = ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Ingredient ingredient = new ChoppingIngredient(rs);
                result.add(ingredient);
            }
            stmt.close();
            return result;
        });
    }

    /**
     * Gets all Stamping-ingredients.
     *
     * @return the ingredient-List
     */
    public List<Ingredient> getStampingIngredients() {
        return db.withConnection(conn -> {
            List<Ingredient> result = new ArrayList<>();
            String sql = "SELECT * FROM `Ingredient` JOIN `StampBehavior` SB on Ingredient.idIngredient = SB.Ingredient_fk";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Ingredient ingredient = new StampingIngredient(rs);
                result.add(ingredient);
            }
            stmt.close();
            return result;
        });
    }

    /**
     * Gets Stamping-ingredients for specific user.
     *
     * @return the ingredient-List
     */
    // Gets available StampingIngredients for specific User
    private List<Ingredient> getStampingIngredients(String email) {
        return db.withConnection(conn -> {
            List<Ingredient> result = new ArrayList<>();
            //String sql = "SELECT * FROM `Ingredient` JOIN `StampBehavior` ON `Ingredient`.idIngredient = `StampBehavior`.Ingredient_fk JOIN `User` ON `Ingredient`.Tier_idTier <= `User`.Tier_idTier WHERE `User`.email = ?";
            String sql = "SELECT * FROM `Ingredient` JOIN `StampBehavior` SB on Ingredient.idIngredient = SB.Ingredient_fk WHERE Tier_idTier <= (SELECT Tier_idTier FROM `User` WHERE email = ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Ingredient ingredient = new StampingIngredient(rs);
                result.add(ingredient);
            }
            stmt.close();
            return result;
        });
    }

    /**
     * Gets all pizzas.
     *
     * @return Order-list
     */
    // Gets ALL Pizzas
    public List<Order> getPizzas() {
        return db.withConnection(conn -> {
            List<Order> result = new ArrayList<>();
            String sql = "SELECT * FROM Pizza";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Order order = new Order(rs);
                result.add(order);
            }
            stmt.close();
            return result;
        });
    }

    /**
     * Gets pizzas for specific user.
     *
     * @param email the email
     * @return the order list
     */
    // Gets available Pizzas for specific User
    public List<Order> getPizzas(String email) {
        return db.withConnection(conn -> {
            List<Order> result = new ArrayList<>();
            String sql = "SELECT * FROM Pizza WHERE idPizza NOT IN (SELECT Pizza_idPizza FROM Ingredient INNER JOIN Pizza_has_Ingredient PhI ON Ingredient.idIngredient = PhI.Ingredient_idIngredient WHERE Tier_idTier > (SELECT Tier_idTier FROM `User` WHERE email = ?))";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Order order = new Order(rs);
                result.add(order);
            }
            stmt.close();
            return result;
        });
    }


    // CLASSES --------------------------------------------------------------------------------------------------------

    /**
     * The type Ingredient.
     */
    public static class Ingredient {
        int id;
        String name; // https://gist.github.com/vikrum/4758434
        String picture_raw;
        String picture_raw_distraction;
        String picture_processed;
        String picture_baked;
        String picture_burnt;

        int zIndex;
        int tier;

        public Ingredient() {
        }

        /**
         * Instantiates a new Ingredient.
         *
         * @param rs the rs
         * @throws SQLException the sql exception
         */
        public Ingredient(ResultSet rs) throws SQLException {
            this.id = rs.getInt("idIngredient");
            this.name = rs.getString("name");
            BufferedInputStream bis_raw = new BufferedInputStream(rs.getBinaryStream("picture_raw"));
            try {
                this.picture_raw = encodeImageToString(ImageIO.read(bis_raw), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting \"picture_raw\"");
            }
            BufferedInputStream bis_raw_distraction = new BufferedInputStream(rs.getBinaryStream("picture_raw_distraction"));
            try {
                this.picture_raw_distraction = encodeImageToString(ImageIO.read(bis_raw_distraction), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting \"picture_raw_distraction\"");
            }
            BufferedInputStream bis_processed = new BufferedInputStream(rs.getBinaryStream("picture_processed"));
            try {
                this.picture_processed = encodeImageToString(ImageIO.read(bis_processed), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting \"picture_processed\"");
            }
            BufferedInputStream bis_baked = new BufferedInputStream(rs.getBinaryStream("picture_baked"));
            try {
                this.picture_baked = encodeImageToString(ImageIO.read(bis_baked), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting \"picture_baked\"");
            }
            BufferedInputStream bis_burnt = new BufferedInputStream(rs.getBinaryStream("picture_burnt"));
            try {
                this.picture_burnt = encodeImageToString(ImageIO.read(bis_burnt), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting \"picture_burnt\"");
            }
            this.zIndex = rs.getInt("zIndex");
            this.tier = rs.getInt("Tier_idTier");
        }

        /**
         * Gets id.
         *
         * @return the id
         */
        public int getId() {
            return id;
        }

        /**
         * Gets name.
         *
         * @return the name
         */
        public String getName() {
            return name;
        }

        /**
         * Gets picture raw.
         *
         * @return the picture raw
         */
        public String getPicture_raw() {
            return picture_raw;
        }

        /**
         * Gets picture raw distraction.
         *
         * @return the picture raw distraction
         */
        public String getPicture_raw_distraction() {
            return picture_raw_distraction;
        }

        /**
         * Gets picture processed.
         *
         * @return the picture processed
         */
        public String getPicture_processed() {
            return picture_processed;
        }

        /**
         * Gets picture baked.
         *
         * @return the picture baked
         */
        public String getPicture_baked() {
            return picture_baked;
        }

        /**
         * Gets picture burnt.
         *
         * @return the picture burnt
         */
        public String getPicture_burnt() {
            return picture_burnt;
        }

        public int getzIndex() {
            return zIndex;
        }

        /**
         * Gets tier.
         *
         * @return the tier
         */
        public int getTier() {
            return tier;
        }
    }

    /**
     * The type Chopping ingredient.
     */
    public class ChoppingIngredient extends Ingredient {

        int vertex_x_inPercent;
        int vertex_y_inPercent;
        double speed;
        int rotation;
        int hits_required;

        /**
         * Instantiates a new Chopping ingredient.
         *
         * @param rs the rs
         * @throws SQLException the sql exception
         */
        public ChoppingIngredient(ResultSet rs) throws SQLException {
            super(rs);

            setFlightBehaviorFromDatabase();
        }

        /**
         * sets the Flight-Behaviour; gets called only in constructor
         */
        private void setFlightBehaviorFromDatabase() {
            db.withConnection(conn -> {
                PreparedStatement stmt = conn.prepareStatement("SELECT * FROM FlightBehavior WHERE Ingredient_fk = ? ");
                stmt.setInt(1, this.id);
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {
                    this.vertex_x_inPercent = rs.getInt("vertex_x_inPercent");
                    this.vertex_y_inPercent = rs.getInt("vertex_y_inPercent");
                    this.speed = rs.getDouble("speed");
                    this.rotation = rs.getInt("rotation");
                    this.hits_required = rs.getInt("hits_required");
                }
                stmt.close();
            });
        }

        /**
         * Gets vertex x in percent.
         *
         * @return the vertex x in percent
         */
        public int getVertex_x_inPercent() {
            return vertex_x_inPercent;
        }

        /**
         * Gets vertex y in percent.
         *
         * @return the vertex y in percent
         */
        public int getVertex_y_inPercent() {
            return vertex_y_inPercent;
        }

        /**
         * Gets speed.
         *
         * @return the speed
         */
        public double getSpeed() {
            return speed;
        }

        /**
         * Gets rotation.
         *
         * @return the rotation
         */
        public int getRotation() {
            return rotation;
        }

        /**
         * Gets hits required.
         *
         * @return the hits required
         */
        public int getHits_required() {
            return hits_required;
        }

        @Override
        public String toString() {
            return "ChoppingIngredient{" +
                    "id=" + id +
                    ", name='" + name + '\'' +
                    ", picture_raw='" + picture_raw + '\'' +
                    ", picture_raw_distractor='" + picture_raw_distraction + '\'' +
                    ", picture_processed='" + picture_processed + '\'' +
                    ", picture_baked='" + picture_baked + '\'' +
                    ", picture_burnt='" + picture_burnt + '\'' +
                    ", tier=" + tier +
                    ", vertex_x_inPercent=" + vertex_x_inPercent +
                    ", vertex_y_inPercent=" + vertex_y_inPercent +
                    ", speed=" + speed +
                    ", rotation=" + rotation +
                    ", hits_required=" + hits_required +
                    '}';
        }
    }

    /**
     * The type Stamping ingredient.
     */
    public class StampingIngredient extends Ingredient {

        int display_time;
        int disabling_time;
        int hits_required;

        /**
         * Instantiates a new Stamping ingredient.
         *
         * @param rs the rs
         * @throws SQLException the sql exception
         */
        public StampingIngredient(ResultSet rs) throws SQLException {
            super(rs);

            setStampBehaviorFromDatabase();
        }

        /**
         * sets Stamp-Behavior; gets called only in constructor
         */
        private void setStampBehaviorFromDatabase() {
            db.withConnection(conn -> {
                PreparedStatement stmt = conn.prepareStatement("SELECT * FROM StampBehavior WHERE Ingredient_fk = ? ");
                stmt.setInt(1, this.id);
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {
                    this.display_time = rs.getInt("display_time");
                    this.disabling_time = rs.getInt("disabling_time");
                    this.hits_required = rs.getInt("hits_required");
                }
                stmt.close();
            });
        }

        /**
         * Gets display time.
         *
         * @return the display time
         */
        public int getDisplay_time() {
            return display_time;
        }

        /**
         * Gets disabling time.
         *
         * @return the disabling time
         */
        public int getDisabling_time() {
            return disabling_time;
        }

        /**
         * Gets hits required.
         *
         * @return the hits required
         */
        public int getHits_required() {
            return hits_required;
        }

        @Override
        public String toString() {
            return "StampingIngredient{" +
                    "id=" + id +
                    ", name='" + name + '\'' +
                    ", picture_raw='" + picture_raw + '\'' +
                    ", picture_raw_distractor='" + picture_raw_distraction + '\'' +
                    ", picture_processed='" + picture_processed + '\'' +
                    ", picture_baked='" + picture_baked + '\'' +
                    ", picture_burnt='" + picture_burnt + '\'' +
                    ", tier=" + tier +
                    ", display_time=" + display_time +
                    ", disabling_time=" + disabling_time +
                    ", hits_required=" + hits_required +
                    '}';
        }
    }


    /**
     * The type Order.
     */
    public class Order { //Ideale Pizza, also einfach Pizza aus Datenbank
        int id;
        String name;
        int points;
        int order_time;
        List<Ingredient> ingredients;

        /**
         * Instantiates a new Order.
         *
         * @param rs the rs
         * @throws SQLException the sql exception
         */
        public Order(ResultSet rs) throws SQLException {
            this.id = rs.getInt("idPizza");
            this.name = rs.getString("name");
            this.points = rs.getInt("points");
            this.order_time = rs.getInt("order_time");
            this.ingredients = new ArrayList<>(setOrderIngredientsFromDatabase());
        }

        /**
         * Sets the ingredients; gets called only in constructor.
         */
        private List<Ingredient> setOrderIngredientsFromDatabase() {
            return db.withConnection(conn -> {
                List<Ingredient> result = new ArrayList<>();
                PreparedStatement stmt = conn.prepareStatement("SELECT Ingredient_idIngredient FROM `Pizza_has_Ingredient` WHERE Pizza_idPizza =? ");
                stmt.setInt(1, getId());
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {
                    result.add(getIngredientById(rs.getInt("Ingredient_idIngredient")));
                }
                stmt.close();
                return result;
            });
        }

        /**
         * Gets id.
         *
         * @return the id
         */
        public int getId() {
            return id;
        }

        /**
         * Gets name.
         *
         * @return the name
         */
        public String getName() {
            return name;
        }

        /**
         * Gets points.
         *
         * @return the points
         */
        public int getPoints() {
            return points;
        }

        /**
         * Gets ingredients.
         *
         * @return the ingredients
         */
        public List<Ingredient> getIngredients() {
            return ingredients;
        }

        /**
         * Gets order time.
         *
         * @return the order time
         */
        public int getOrder_time() {
            return order_time;
        }
    }
}
