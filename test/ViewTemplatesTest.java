import controllers.AssetsFinder;
import org.junit.Before;
import org.junit.Test;
import play.test.WithApplication;
import play.twirl.api.Content;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A functional test starts a Play application for every test.
 * <p>
 * https://www.playframework.com/documentation/latest/JavaFunctionalTest
 */
public class ViewTemplatesTest extends WithApplication {
    AssetsFinder assetsFinder;

    @Before
    public void provideAssetsFinder() {
        assetsFinder = provideApplication().injector().instanceOf(AssetsFinder.class);
    }

    @Test
    public void renderCreateAccountTemplate() {
        Content html = views.html.createAccount.render("CreateAccount", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("PIZZA RAGAZZI");
        assertThat(html.body()).contains("PASSWORT WIEDERHOLEN");
    }


    @Test
    public void renderHighscoreTemplate() {
        Content html = views.html.highscore.render("Highscore", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Highscores");
    }


    @Test
    public void renderLoginTemplate() {
        Content html = views.html.login.render("Login", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("PIZZA RAGAZZI");
        assertThat(html.body()).contains("ANMELDEN");
    }

    @Test
    public void renderMemoryTemplate() {
        Content html = views.html.memory.render("Memory", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Memory");
    }

    @Test
    public void renderMenuTemplate() {
        Content html = views.html.menu.render("Menu", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Pizza Rush");
        assertThat(html.body()).contains("Memory");
        assertThat(html.body()).contains("Tutorial");
    }

    @Test
    public void renderNavbarTemplate() {
        Content html = views.html.navbar.render(assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Menü");
        assertThat(html.body()).contains("Profil");
        assertThat(html.body()).contains("Highscores");
        assertThat(html.body()).contains("Logout");
    }

    @Test
    public void renderPizzarushTemplate() {
        Content html = views.html.pizzarush.render("Pizza-Rush", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("menu");
    }

    @Test
    public void renderProfileTemplate() {
        Content html = views.html.profile.render("Profile", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Profile");
        assertThat(html.body()).contains("Freunde");
        assertThat(html.body()).contains("Chat");
    }

    @Test
    public void renderTutorialTemplate() {
        Content html = views.html.tutorial.render("Tutorial", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Tutorial");
    }
}
