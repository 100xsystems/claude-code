import com.systems.testhelper.BaseTest;
import org.junit.jupiter.api.Test;

/**
 * Behavioral tests for Lesson 1: Introduction & Java Project Setup.
 *
 * Validates that the user has set up their Maven project correctly
 * with the required dependencies and project structure.
 */
class Lesson1Test extends BaseTest {

    @Test
    void hasPomXml() {
        assertFileExists("pom.xml");
    }

    @Test
    void pomHasPicocliDependency() {
        assertFileContains("pom.xml", "picocli");
    }

    @Test
    void pomHasJacksonDependency() {
        assertFileContains("pom.xml", "jackson");
    }

    @Test
    void hasMainEntryPoint() {
        assertFileExists("src/main/java/com/claudecode/Main.java");
    }

    @Test
    void hasCliApplication() {
        assertFileExists("src/main/java/com/claudecode/cli/CLIApplication.java");
    }

    @Test
    void projectCompiles() {
        expectBuildSucceeds();
    }
}
