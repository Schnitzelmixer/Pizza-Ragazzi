import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import play.Application;
import play.test.Helpers;
import play.test.TestBrowser;
import play.test.WithBrowser;

import static org.junit.Assert.assertTrue;
import static play.test.Helpers.fakeApplication;
import static play.test.Helpers.inMemoryDatabase;

public class BrowserTest extends WithBrowser {

    protected Application provideApplication() {
        return fakeApplication(inMemoryDatabase());
    }

    protected TestBrowser provideBrowser(int port) {
        return Helpers.testBrowser(port);
    }
    //TODO https://www.playframework.com/documentation/2.8.x/JavaFunctionalTest

    @Test
    public void testLogin() {
        browser.goTo("http://localhost:" + play.api.test.Helpers.testServerPort() + "/");

        assertTrue(browser.pageSource().contains("PIZZA RAGAZZI"));
        assertTrue(browser.pageSource().contains("PASSWORT"));
    }

    @Test
    public void testCreateAccountFromLogin() {
        // First, go to Login
        browser.goTo("http://localhost:" + play.api.test.Helpers.testServerPort() + "/createAccount");

        // Click on "Account erstellen"
        WebDriver driver = browser.getDriver();
        driver.findElement(By.id("createAccount_button")).click();

        // Create Account Page is shown
        assertTrue(browser.pageSource().contains("PASSWORT WIEDERHOLEN")); // this field is unique to this page
    }
}
