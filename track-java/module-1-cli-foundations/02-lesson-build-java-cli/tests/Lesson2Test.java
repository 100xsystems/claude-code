import com.systems.testhelper.BaseTest;
import org.junit.jupiter.api.Test;

/**
 * Behavioral tests for Lesson 2: Build the Java CLI with Picocli.
 *
 * Validates that the user has implemented the CLI with Picocli annotations,
 * including subcommands, interactive mode, and the Agent class.
 */
class Lesson2Test extends BaseTest {

    @Test
    void hasCliApplication() {
        assertFileExists("src/main/java/com/claudecode/cli/CLIApplication.java");
    }

    @Test
    void cliUsesPicocliAnnotations() {
        assertFileContains("src/main/java/com/claudecode/cli/CLIApplication.java", "@Command");
    }

    @Test
    void cliHasSubcommands() {
        assertFileContains("src/main/java/com/claudecode/cli/CLIApplication.java", "subcommands");
    }

    @Test
    void hasChatCommand() {
        assertFileContains("src/main/java/com/claudecode/cli/CLIApplication.java", "chat");
    }

    @Test
    void hasAgentClass() {
        assertFileExists("src/main/java/com/claudecode/agent/Agent.java");
    }

    @Test
    void projectCompiles() {
        expectBuildSucceeds();
    }
}
