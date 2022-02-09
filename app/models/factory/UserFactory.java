package models.factory;

import com.mysql.cj.jdbc.exceptions.MysqlDataTruncation;
import models.Message;
import models.factory.factoryExceptions.EmailAlreadyInUseException;
import models.factory.factoryExceptions.InvalidEmailException;
import models.factory.factoryExceptions.ProfilePictureException;
import models.factory.factoryExceptions.UsernameAlreadyInUseException;
import play.db.Database;

import javax.imageio.ImageIO;
import javax.inject.Inject;
import javax.inject.Singleton;
import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.*;
import java.util.*;


/**
 * The type User factory.
 */
@Singleton
public class UserFactory {

    private final Database db;

    /**
     * Instantiates a new User factory.
     *
     * @param db the db
     */
    @Inject
    public UserFactory(Database db) {
        this.db = db;
    }

    /**
     * Authenticates a user with the given credentials
     *
     * @param email    email from user input
     * @param password password from user input
     * @return Found user or null if user not found
     */
    public User authenticateUser(String email, String password) {
        return db.withConnection(conn -> {
            User user = null;
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM User WHERE email = ? AND password = ?");
            stmt.setString(1, email);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                user = new User(rs);
            }
            stmt.close();
            return user;
        });
    }

    /**
     * Creates a user in the db but throws Exceptions if its not possible.
     *
     * @param email    the email
     * @param name     the name
     * @param password the password
     * @return the user
     */
    //TODO complete this
    public User createUser(String email, String name, String password) {
        if (!email.matches("[a-zA-Z0-9._%+-]+[@]+[a-zA-Z0-9.-]+[.]+[a-zA-Z]{2,6}"))
            throw new InvalidEmailException("The e-mail " + email + " is not valid");
        if (!isEmailAvailable(email))
            throw new EmailAlreadyInUseException("The e-mail " + email + " is already in use");
        if (!isUsernameAvailable(email))
            throw new UsernameAlreadyInUseException("The username " + name + " is already in use");
        return db.withConnection(conn -> {
            String sql = "INSERT INTO User (username, email, password, gesamtpunkte, highscore, Tier_idTier) VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, password);
            stmt.setInt(4, 0);
            stmt.setInt(5, 0);
            stmt.setInt(6, 1);
            stmt.executeUpdate();
            stmt.close();
            return getUserByEmail(email);
        });
    }

    /**
     * Checks if a user exists in the db
     *
     * @param email the unique identifier of the user, his email address
     * @return true if there is no user, false if the email is already in use
     */
    public boolean isEmailAvailable(String email) {
        User user = getUserByEmail(email);
        return user == null;
    }

    /**
     * Gets user from db by email.
     *
     * @param email the email
     * @return the user by email
     */
    public User getUserByEmail(String email) {
        if (!email.matches("[a-zA-Z0-9._%+-]+[@]+[a-zA-Z0-9.-]+[.]+[a-zA-Z]{2,6}"))
            throw new InvalidEmailException("The e-mail \"" + email + "\" is not valid");
        return db.withConnection(conn -> {
            User user = null;
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM User WHERE email = ?");
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                user = new User(rs);
            }
            stmt.close();
            return user;
        });
    }

    /**
     * Checks if a user exists in the db
     *
     * @param username the unique identifier of the user, his email address
     * @return true if there is no user, false if the email is already in use
     */
    public boolean isUsernameAvailable(String username) {
        User user = getUserByUsername(username);
        return user == null;
    }

    /**
     * Gets user from db by username.
     *
     * @param username the username
     * @return the user by username
     */
    public User getUserByUsername(String username) {
        return db.withConnection(conn -> {
            User user = null;
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM User WHERE username = ?");
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                user = new User(rs);
            }
            stmt.close();
            return user;
        });
    }

    /**
     * Retrieves a user from database with given ID
     *
     * @param id id of user to find
     * @return User if found, else null
     */
    public User getUserById(int id) {
        return db.withConnection(conn -> {
            User user = null;
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM User WHERE idUser = ?");
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                user = new User(rs);
            }
            stmt.close();
            return user;
        });
    }

    /**
     * Polymorphism method for getUserById(int)
     *
     * @param id String of id
     * @return User if found, else null
     */
    public User getUserById(String id) {
        return getUserById(Integer.parseInt(id));
    }

    /**
     * Gets all users from db.
     *
     * @return all users
     */
    public List<User> getAllUsers() {
        return db.withConnection(conn -> {
            List<User> users = new ArrayList<>();
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM User");
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                User user = new User(rs);
                users.add(user);
            }
            stmt.close();
            return users;
        });
    }

    /**
     * Get a list of all highscore-entries.
     *
     * @return ArrayList of String[]{username, highscore}
     */
    public ArrayList<String[]> getHighscoreData() {

        List<UserFactory.User> users = getAllUsers();
        users.sort(Comparator.comparing(User::getHighScore).reversed());

        ArrayList<String[]> data = new ArrayList<>();

        for (int i = 0; i < Math.min(users.size(), 10); i++) {
            User current = users.get(i);

            if (current.getHighScore() > 0) {
                String[] entry = new String[]{current.getUsername(), String.valueOf(current.getHighScore())};
                data.add(entry);
            }
        }
        return data;
    }


    /**
     * The type User.
     */
    public class User {
        private int id;
        private String username;
        private String email;
        private int totalPoints;
        private int highScore;
        private BufferedImage profilePicture;
        private int currentTier;

        /**
         * Instantiates a new User.
         *
         * @param id             the id
         * @param username       the username
         * @param email          the email
         * @param totalPoints    the total points
         * @param highScore      the high score
         * @param profilePicture the profile picture
         * @param currentTier    the current tier
         */
        public User(int id, String username, String email, int totalPoints, int highScore, BufferedImage profilePicture, int currentTier) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.totalPoints = totalPoints;
            this.highScore = highScore;
            this.profilePicture = profilePicture;
            this.currentTier = currentTier;
        }

        /**
         * Instantiates a new User with ResultSet from db
         *
         * @param rs the ResultSet from db
         * @throws SQLException if result set doesnt contain values
         */
        private User(ResultSet rs) throws SQLException {
            this.id = rs.getInt("idUser");
            this.username = rs.getString("username");
            this.email = rs.getString("email");
            this.totalPoints = rs.getInt("gesamtpunkte");
            this.highScore = rs.getInt("highscore");
            BufferedInputStream bis = new BufferedInputStream(rs.getBinaryStream("profilepicture"));
            try {
                profilePicture = ImageIO.read(bis);
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the profile picture");
            }
            this.currentTier = rs.getInt("Tier_idTier");
        }

        /**
         * Updates the user if it already exists and creates it otherwise. Assumes an
         * autoincrement id column.
         */
        //TODO: add BufferedImage profilePicture
        public void save() {
            db.withConnection(conn -> {
                String sql = "UPDATE User SET username = ?, email = ?, gesamtpunkte = ?, highscore = ?, Tier_idTier = ? WHERE idUser = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, this.username);
                stmt.setString(2, this.email);
                stmt.setInt(3, this.totalPoints);
                stmt.setInt(4, this.highScore);
                stmt.setInt(5, this.currentTier);
                stmt.setInt(6, this.id);
                stmt.executeUpdate();
                stmt.close();
            });
        }

        /**
         * Delete the user from the database
         */
        public void delete() {
            db.withConnection(conn -> {
                String sql = "DELETE FROM User WHERE idUser = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, this.id);
                stmt.executeUpdate();
                stmt.close();
            });
        }

        /**
         * Add a friend by his id
         *
         * @param id2 the id 2
         * @return the boolean if it was successfull
         */
        public boolean addFriend(int id2) {
            if (this.id == id2) return false;

            List<User> allUsers = getAllUsers();
            List<User> friends = getFriends();
            boolean id2Exists = false;
            boolean alreadyFriend = false;

            for (User user : allUsers) {        //checken ob es User mit der id gibt
                if (user.getId() == id2) {
                    id2Exists = true;
                    break;
                }
            }

            for (User user : friends) {         //checken ob sie schon befreundet sind
                if (user.getId() == id2) {
                    alreadyFriend = true;
                    break;
                }
            }

            if (id2Exists && !alreadyFriend) {
                db.withConnection(conn -> {
                    PreparedStatement stmt = conn.prepareStatement("INSERT INTO `Friendship` (User_idUser_one, User_idUser_two) VALUES (?, ?)");
                    stmt.setInt(1, this.id);
                    stmt.setInt(2, id2);
                    stmt.executeUpdate();
                    stmt.close();
                });
                return true;
            }
            return false;
        }

        /**
         * Gets friends of user as List.
         *
         * @return the friends-List
         */
        public List<User> getFriends() {
            return db.withConnection(conn -> {
                List<User> result = new ArrayList<>();
                String sql = "SELECT * FROM `Friendship` WHERE User_idUser_One = ? OR User_idUser_Two = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, this.id);
                stmt.setInt(2, this.id);
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {

                    int friendId = (int) rs.getObject("User_idUser_one");
                    if (friendId == this.id) {
                        friendId = (int) rs.getObject("User_idUser_two");
                    }
                    User user = getUserById(friendId);
                    result.add(user);
                }
                stmt.close();
                return result;
            });
        }

        /**
         * Gets friends-Map with profilePictureSource and username.
         *
         * @return the friends data
         */
        public Map<String, String> getFriendsData() {

            List<User> users = getFriends();

            Map<String, String> data = new HashMap<>();

            for (User user : users) {
                //Sets default Profile pic if none was Uploaded
                String path = user.getProfilePictureSrc();
                data.put(user.username, path);
            }
            return data;

        }


        /**
         * Gets messages-List from db sent to and retrieved from user2.
         *
         * @param user2 the user 2
         * @return the messages
         */
        public List<Message> getMessages(User user2) {
            if (user2 == null) return null;

            List<User> friends = getFriends();

            boolean isFriend = false;  //checken, ob sie befreundet sind
            for (User user : friends) {
                if (user.getId() == user2.getId()) {
                    isFriend = true;
                    break;
                }
            }

            if (isFriend) {
                return db.withConnection(conn -> {
                    List<Message> result = new ArrayList<>();

                    String sql = "SELECT * FROM `Message` WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY `time`";
                    PreparedStatement stmt = conn.prepareStatement(sql);
                    stmt.setInt(1, this.id);
                    stmt.setInt(2, user2.getId());
                    stmt.setInt(3, user2.getId());
                    stmt.setInt(4, this.id);
                    ResultSet rs = stmt.executeQuery();
                    while (rs.next()) {
                        Message message = new Message(rs);
                        //ich füge für jedes Message Objekt noch den username der Beteiligten hinzu
                        if (message.getSender() == this.id) {
                            message.setSenderName(this.getUsername());
                            message.setReceiverName(user2.getUsername());
                        } else {
                            message.setReceiverName(this.getUsername());
                            message.setSenderName(user2.getUsername());
                        }
                        result.add(message);
                    }
                    stmt.close();
                    return result;
                });
            }
            return null;
        }

        /**
         * Inserts a new Row into Message db-Table.
         *
         * @param receiverId   the receiver id
         * @param timestamp    the timestamp
         * @param message_text the message text
         */
        public void sendMessage(int receiverId, Timestamp timestamp, String message_text) {
            db.withConnection(conn -> {
                String sql = "INSERT INTO `Message` (sender, receiver, time, message_text ) VALUES (?, ?, ?, ?)";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, this.id);
                stmt.setInt(2, receiverId);
                stmt.setObject(3, timestamp);
                stmt.setString(4, message_text);
                stmt.executeUpdate();
                stmt.close();
            });
        }

        /**
         * Gets name of Tier from tier id.
         *
         * @return the name from tier id
         */
        public String getNameFromTierId() {
            return db.withConnection(conn -> {
                String tierName = null;
                PreparedStatement stmt = conn.prepareStatement("SELECT name FROM `Tier` WHERE idTier = ?");
                stmt.setInt(1, this.currentTier);
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    tierName = rs.getString("name");
                }
                stmt.close();
                return tierName;
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
         * Sets id.
         *
         * @param id the id
         */
        public void setId(int id) {
            this.id = id;
            save();
        }

        /**
         * Gets username.
         *
         * @return the username
         */
        public String getUsername() {
            return username;
        }

        /**
         * Sets username.
         *
         * @param username the username
         */
        public void setUsername(String username) {
            this.username = username;
            save();
        }

        /**
         * Gets email.
         *
         * @return the email
         */
        public String getEmail() {
            return email;
        }

        /**
         * Sets email.
         *
         * @param email the email
         */
        public void setEmail(String email) {
            this.email = email;
            save();
        }

        /**
         * Gets total points.
         *
         * @return the total points
         */
        public int getTotalPoints() {
            return totalPoints;
        }

        /**
         * Sets total points.
         *
         * @param totalPoints the total points
         */
        public void setTotalPoints(int totalPoints) {
            this.totalPoints = totalPoints;
            save();
        }

        /**
         * Gets high score.
         *
         * @return the high score
         */
        public int getHighScore() {
            return highScore;
        }

        /**
         * Sets high score.
         *
         * @param highScore the high score
         */
        public void setHighScore(int highScore) {
            this.highScore = highScore;
            save();
        }

        /**
         * Gets profile picture.
         *
         * @return the profile picture
         */
        public BufferedImage getProfilePicture() {
            return profilePicture;
        }

        /**
         * Sets profile picture.
         *
         * @param profilePicture the profile picture
         */
        public void setProfilePicture(BufferedImage profilePicture) {
            this.profilePicture = profilePicture;
        }

        /**
         * Gets profile picture src.
         *
         * @return the profile picture src
         */
        public String getProfilePictureSrc() {
            String path = null;
            if (profilePicture != null) {
                path = encodeToString(profilePicture, "jpg");
            }
            return path;
        }

        /**
         * Encode to string string.
         *
         * @param image the image
         * @param type  the type
         * @return the string
         */
        public String encodeToString(BufferedImage image, String type) {
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

        public void updateProfilePicture(String sourceData) {
            db.withConnection(conn -> {
                String sql = "UPDATE User SET profilepicture=? WHERE idUser = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                try {
                    var imageData = sourceData.split("base64,")[1];
                    byte[] bytes = Base64.getMimeDecoder().decode(imageData);
                    stmt.setBytes(1, bytes);
                    stmt.setInt(2, this.id);
                } catch (MysqlDataTruncation large) {
                    large.printStackTrace();
                    throw new ProfilePictureException("Image was too large");
                }
                stmt.executeUpdate();
                stmt.close();
            });
        }

        /**
         * Gets current tier.
         *
         * @return the current tier
         */
        public int getCurrentTier() {
            return currentTier;
        }

        /**
         * Sets current tier.
         *
         * @param currentTier the current tier
         */
        public void setCurrentTier(int currentTier) {
            this.currentTier = currentTier;
            save();
        }
    }
}
