package controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import models.Message;
import models.factory.UserFactory;
import models.factory.factoryExceptions.InvalidEmailException;
import models.factory.factoryExceptions.ProfilePictureException;
import play.data.Form;
import play.data.FormFactory;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;
import viewmodels.UserViewModel;

import javax.inject.Inject;
import java.sql.Timestamp;
import java.util.List;


/**
 * The type Profile controller.
 */
public class ProfileController extends Controller {

    private final FormFactory formFactory;
    private final UserFactory userFactory;

    /**
     * Instantiates a new Profile controller.
     *
     * @param formFactory the form factory
     * @param userFactory the user factory
     */
    @Inject
    public ProfileController(FormFactory formFactory, UserFactory userFactory) {
        this.formFactory = formFactory;
        this.userFactory = userFactory;
    }

    /**
     * @param request the html request
     * @return the current logged in User from the email stored in the session
     */
    public UserFactory.User getCurrentUser(Http.Request request) {
        String email;
        if (request.session().get("email").isPresent()) {
            email = request.session().get("email").get();
            return userFactory.getUserByEmail(email);
        } else {
            throw new InvalidEmailException("There is no email of the current logged in User stored in the session");
        }
    }

    /**
     * Updates Username and adds it to session
     *
     * @param request the request
     * @return the username
     */
    public Result setUsername(Http.Request request) {
        Form<UserViewModel> form = formFactory.form(UserViewModel.class); // Ein ViewModel gibt quasi die Form vor, wie aus einem request gelesen werden soll (dafür auch das Package "ViewModels" :))
        UserViewModel userViewModel = form.bindFromRequest(request).get();

        UserFactory.User user = getCurrentUser(request);
        user.setUsername(userViewModel.getUsername());

        return ok(userViewModel.getUsername()).addingToSession(request, "username", userViewModel.getUsername()); // Speichert den Username in der Session unter dem Key "username"
    }

    /**
     * Updates Users Profile Picture.
     *
     * @param request the request
     * @return the result with ok-Status if successfull, else badRequest with ProfilePictureException-message
     */
    public Result setProfilePicture(Http.Request request) {
        UserFactory.User user = getCurrentUser(request);

        String image = request.body().asJson().get("img").toString();
        try {
            user.updateProfilePicture(image);
        } catch (ProfilePictureException e) {
            return badRequest(e.getMessage());
        }
        //user.setProfilePicture(image);
        return ok();
    }

    /**
     * Gets email from session.
     *
     * @param request the request
     * @return the email from session
     */
// Reads key "email" from session and returns it
    public Result getEmailFromSession(Http.Request request) {
        return request
                .session()
                .get("email") // Sucht nach dem Wert in der Session, der unter dem Key "Username" abgelegt ist
                .map(Results::ok)
                .orElseGet(Results::notFound);
    }

    /**
     * returns the username
     * by getting the user from the db with it`s email from the session
     *
     * @param request the request
     * @return result
     */
    public Result getUsernameFromDatabase(Http.Request request) {
        UserFactory.User user = getCurrentUser(request);
        return ok(user.getUsername());
    }

    /**
     * Gets Users email from database.
     *
     * @param request the request
     * @return the email from database
     */
    public Result getEmailFromDatabase(Http.Request request) {
        UserFactory.User user = getCurrentUser(request);
        return ok(user.getEmail());
    }

    /**
     * Gets Users gesamtpunkte from database.
     *
     * @param request the request
     * @return the gesamtpunkte from database
     */
    public Result getGesamtpunkteFromDatabase(Http.Request request) {
        UserFactory.User user = getCurrentUser(request);
        return ok(Integer.toString(user.getTotalPoints()));
    }

    /**
     * Gets Users highscore from database.
     *
     * @param request the request
     * @return the highscore from database
     */
    public Result getHighscoreFromDatabase(Http.Request request) {
        UserFactory.User user = getCurrentUser(request);
        return ok(Integer.toString(user.getHighScore()));
    }

    /**
     * Gets Users tier name from database.
     *
     * @param request the request
     * @return the tier name from database
     */
    public Result getTierNameFromDatabase(Http.Request request) {
        UserFactory.User user = getCurrentUser(request);
        return ok(user.getNameFromTierId());
    }

    /**
     * Gets Users profile picture from database.
     *
     * @param request the request
     * @return the profile picture from database
     */
    public Result getProfilePictureFromDatabase(Http.Request request) {
        UserFactory.User user = getCurrentUser(request);
        return ok(Json.toJson(user.getProfilePictureSrc()));
    }

    /**
     * Gets Users specific Friends Data (ProfilePic and Username).
     *
     * @param request the request
     * @return the friends data
     */
    public Result getFriendsData(Http.Request request) {
        UserFactory.User user = getCurrentUser(request);
        return ok(Json.toJson(user.getFriendsData()));
    }


    /**
     * Gets Users messages from database.
     *
     * @param request the request
     * @return gibt Messages mit bestimmtem Freund zurück
     */
    public Result getMessagesFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user1 = getCurrentUser(request);
        UserFactory.User user2 = userFactory.getUserByUsername(username);
        List<Message> messages = user1.getMessages(user2);
        String json = listToJson(messages);
        return ok(json);
    }

    /**
     * Inserts a sent message into Message-Table in db.
     *
     * @param request the request
     * @return the result
     */
    public Result sendMessage(Http.Request request) {
        UserFactory.User sender = getCurrentUser(request);
        UserFactory.User receiver = userFactory.getUserByUsername(request.body().asJson().get("receiver").asText());
        String message_text = request.body().asJson().get("message_text").asText();
        long time = request.body().asJson().get("time").asLong();
        Timestamp timestampSQL = new Timestamp(time + 3600000); //milliseconds to add for localTime
        sender.sendMessage(receiver.getId(), timestampSQL, message_text);
        return ok();
    }

    /**
     * Inserts a new row in Friendship-Table.
     *
     * @param request the request
     * @return the result with ok-Status if successfull else badRequest
     */
    public Result addFriend(Http.Request request) {
        UserFactory.User user = getCurrentUser(request);

        String newFriendUsername = request.body().asJson().asText();
        UserFactory.User newFriendUser = userFactory.getUserByUsername(newFriendUsername);

        boolean successful;
        if (newFriendUser != null) {
            successful = user.addFriend(newFriendUser.getId());
        } else {
            return badRequest("username not valid");
        }

        if (successful) {
            return ok();
        } else {
            return badRequest("username not valid");
        }
    }

    /**
     * Converts any list to json string.
     *
     * @param <T>  the type parameter
     * @param list the list
     * @return the string
     */
//macht aus einer beliebigen Liste ein Json
    public <T> String listToJson(List<T> list) {
        ObjectMapper objectMapper = new ObjectMapper();
        String json = "";
        try {
            json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(list);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return json;
    }


    //AB HIER METHODEN ZUM ANSCHAUEN DES PROFILS EINES FREUNDES

    /**
     * Gets Friends Username from db
     *
     * @param request the request
     * @return Result result
     */
    public Result friendGetUsernameFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(user.getUsername());
    }

    /**
     * Gets Friends Email from db
     *
     * @param request the request
     * @return the result
     */
    public Result friendGetEmailFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(user.getEmail());
    }

    /**
     * Gets Friends Gesamtpunkte from db
     *
     * @param request the request
     * @return the result
     */
    public Result friendGetGesamtpunkteFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Integer.toString(user.getTotalPoints()));
    }

    /**
     * Gets Friends Highscore from db
     *
     * @param request the request
     * @return the result
     */
    public Result friendGetHighscoreFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Integer.toString(user.getHighScore()));
    }

    /**
     * Gets Friends Tier name from db
     *
     * @param request the request
     * @return the result
     */
    public Result friendGetTierNameFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(user.getNameFromTierId());
    }

    /**
     * Gets Friends ProfilePic from db
     *
     * @param request the request
     * @return the result
     */
    public Result friendGetProfilePictureFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Json.toJson(user.getProfilePictureSrc()));
    }

    /**
     * Gets Friends friendsData (ProfilePic and Username) from db
     *
     * @param request the request
     * @return the result
     */
    public Result friendFriendsData(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Json.toJson(user.getFriendsData()));
    }
}