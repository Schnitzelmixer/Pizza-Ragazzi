package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import models.LevelUp;
import models.factory.MemoryFactory;
import models.factory.UserFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import javax.inject.Inject;
import java.util.List;

public class MemoryController extends Controller {

    private final MemoryFactory memoryFactory;
    private final UserFactory userFactory;
    private final LevelUp levelUp;

    @Inject
    public MemoryController(MemoryFactory memoryFactory, UserFactory userFactory, LevelUp levelUp) {

        this.memoryFactory = memoryFactory;
        this.userFactory = userFactory;
        this.levelUp = levelUp;
    }

    /**
     * @param request Html request
     * @return Result which is either bad request or the list
     */
    public Result getMemoryIngredients(Http.Request request) {
        String email;
        if (request.session().get("email").isPresent()) {
            email = request.session().get("email").get();
        } else {
            return badRequest("Can't identify User: No E-Mail in session");
        }

        UserFactory.User user = userFactory.getUserByEmail(email);

        List<MemoryFactory.MemoryIngredient> ingredients;

        if (levelUp.checkForLevelUp(user).isLevelUpPossible()) {
            ingredients = memoryFactory.getMemoryIngredientsForNextTier(email);
        } else {
            ingredients = memoryFactory.getMemoryIngredients(email);
        }

        String json = listToJson(ingredients);
        return ok(json);
    }

    /**
     * @param list the list which should be transformed to a json
     * @param <T>  any listtype
     * @return the list as an json string
     */
    // converts any list into Json
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

    /**
     * @param request Html request
     * @return either badrequest or the new tier
     */
    public Result setCurrentPlayerTier(Http.Request request) {
        JsonNode json = request.body().asJson();
        String email = request.session().get("email").get();
        if (json == null) {
            return badRequest("Expecting Json data");
        } else {
            int newTier = json.findPath("newTier").asInt();
            if (email.isEmpty()) {
                return badRequest("usermail was empty");
            }
            UserFactory.User user = userFactory.getUserByEmail(email);
            if (user == null) {
                return badRequest("user co uld be fetched via mail");
            }
            user.setCurrentTier(newTier);
            return ok("Tier successfully updated");
        }
    }
}
