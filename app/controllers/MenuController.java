package controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import models.LevelUp;
import models.factory.UserFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import javax.inject.Inject;

/**
 * The type Menu controller.
 */
public class MenuController extends Controller {

    private final LevelUp levelUp;
    private final UserFactory userFactory;

    /**
     * Instantiates a new Menu controller.
     *
     * @param levelUp     the menu
     * @param userFactory the user factory
     */
    @Inject
    public MenuController(LevelUp levelUp, UserFactory userFactory) {
        this.levelUp = levelUp;
        this.userFactory = userFactory;
    }

    /**
     * Check for tier level up of User.
     *
     * @param request the request
     * @return the result
     */
    public Result checkForLevelUp(Http.Request request) {
        String email;
        if (request.session().get("email").isPresent()) {
            email = request.session().get("email").get();
        } else {
            return badRequest("Couldn't retrieve email from session");
        }

        UserFactory.User user = userFactory.getUserByEmail(email);

        return ok(listToJson(levelUp.checkForLevelUp(user)));
    }


    /**
     * Converts any list to json string.
     *
     * @param list the list
     * @return the string
     */
// converts any list into Json
    public String listToJson(LevelUp.LevelUpViewModel list) {
        ObjectMapper objectMapper = new ObjectMapper();
        String json = "";
        try {
            json = objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return json;
    }
}
