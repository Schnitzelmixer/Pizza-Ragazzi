package controllers;

import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import views.html.*;

import javax.inject.Inject;

/**
 * This controller contains an action to handle HTTP requests
 * to the application's home page.
 */
public class HomeController extends Controller {

    private final AssetsFinder assetsFinder;

    /**
     * Instantiates a new Home controller.
     *
     * @param assetsFinder the assets finder
     */
    @Inject
    public HomeController(AssetsFinder assetsFinder) {
        this.assetsFinder = assetsFinder;
    }

    /**
     * An action that renders an HTML page with a welcome message.
     * The configuration in the <code>routes</code> file means that
     * this method will be called when the application receives a
     * <code>GET</code> request with a path of <code>/</code>.
     *
     * @param request the request
     * @return the result
     */
    public Result index(Http.Request request) {
        if (checkIfLoggedIn(request)) {
            return ok(pizzarush.render("Login", assetsFinder));
        } else {
            return ok(login.render("Login", assetsFinder));
        }
    }

    /**
     * Renders Highscore-page
     *
     * @param request the request
     * @return the result
     */
    public Result highscore(Http.Request request) {
        if (checkIfLoggedIn(request)) {
            return ok(highscore.render("Highscores", assetsFinder));
        } else {
            return ok(login.render("Login", assetsFinder));
        }
    }

    /**
     * Renders Profile-Page.
     *
     * @param request the request
     * @return the result
     */
    public Result profile(Http.Request request) {
        if (checkIfLoggedIn(request)) {
            return ok(profile.render("Profile", assetsFinder));
        } else {
            return ok(login.render("Login", assetsFinder));
        }
    }

    /**
     * Renders Menu.
     *
     * @param request the request
     * @return the result
     */
    public Result menu(Http.Request request) {
        if (checkIfLoggedIn(request)) {
            return ok(menu.render("Menu", assetsFinder));
        } else {
            return ok(login.render("Login", assetsFinder));
        }
    }

    /**
     * Renders the createAccount-page
     *
     * @return the result
     */
    public Result createAccount() {
        return ok(createAccount.render("CreateAccount", assetsFinder));
    }

    /**
     * Renders the PizzaRush-page
     *
     * @param request the request
     * @return the result
     */
    public Result pizzaRush(Http.Request request) {
        if (checkIfLoggedIn(request)) {
            return ok(pizzarush.render("Pizza-Rush", assetsFinder));
        } else {
            return ok(login.render("Login", assetsFinder));
        }
    }

    /**
     * Renders the Memory-page
     *
     * @param request Html request
     * @return Result with either the Memory or Loginpage
     */
    public Result memory(Http.Request request) {
        if (checkIfLoggedIn(request)) {
            return ok(memory.render("Memory", assetsFinder));
        } else {
            return ok(login.render("Login", assetsFinder));
        }
    }

    /**
     * Renders the Tutorial-Popup
     *
     * @param request Html request
     * @return with either the tutorial or Loginpage
     */
    public Result tutorial(Http.Request request) {
        if (checkIfLoggedIn(request)) {
            return ok(tutorial.render("Tutorial", assetsFinder));
        } else {
            return ok(login.render("Login", assetsFinder));
        }
    }

    /**
     * Checks if a User is currently logged in
     *
     * @param request the request
     * @return boolean if the user is logged in or not
     */
    public boolean checkIfLoggedIn(Http.Request request) {// check if User is logged in
        return request.session().get("email").isPresent();
    }

}
