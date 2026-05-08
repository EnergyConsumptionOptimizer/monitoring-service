import { projectFiles } from "archunit";
import { describe, expect, it } from "vitest";

describe("Clean Architecture Rules", () => {
  describe("The domain should not depend on outer layers", () => {
    it("Domain should not depend on application", async () => {
      const rule = projectFiles()
        .inFolder("src/domain/**")
        .shouldNot()
        .dependOnFiles()
        .inFolder("src/application/**");
      await expect(rule).toPassAsync();
    });

    it("Domain should not depend on infrastructure", async () => {
      const rule = projectFiles()
        .inFolder("src/domain/**")
        .shouldNot()
        .dependOnFiles()
        .inFolder("src/infrastructure/**");
      await expect(rule).toPassAsync();
    });
    it("Domain should not depend on presentation", async () => {
      const rule = projectFiles()
        .inFolder("src/domain/**")
        .shouldNot()
        .dependOnFiles()
        .inFolder("src/presentation/**");
      await expect(rule).toPassAsync();
    });
  });
  describe("The application should not depend on outer layers", () => {
    it("Domain should not depend on infrastructure", async () => {
      const rule = projectFiles()
        .inFolder("src/application/**")
        .shouldNot()
        .dependOnFiles()
        .inFolder("src/infrastructure/**");
      await expect(rule).toPassAsync();
    });

    it("Application should not depend on presentation", async () => {
      const rule = projectFiles()
        .inFolder("src/application/**")
        .shouldNot()
        .dependOnFiles()
        .inFolder("src/presentation/**");
      await expect(rule).toPassAsync();
    });
  });
  describe("The infrastructure should not depend on outer layers", () => {
    it("Infrastructure should not depend on presentation", async () => {
      const rule = projectFiles()
        .inFolder("src/infrastructure/**")
        .shouldNot()
        .dependOnFiles()
        .inFolder("src/presentation/**");
      await expect(rule).toPassAsync();
    });
  });
});
