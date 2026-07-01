import { router } from "expo-router";

class NavigationService {
  private static instance: NavigationService;
  private lastNavigation: string | null = null;

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  navigateToLogin() {
    try {
      // Prevent duplicate navigation
      if (this.lastNavigation === "login") {
        return;
      }
      this.lastNavigation = "login";
      router.replace("/");
    } catch (error) {
      console.error("Failed to navigate to login:", error);
    }
  }

  navigateToHome() {
    try {
      // Prevent duplicate navigation
      if (this.lastNavigation === "home") {
        return;
      }
      this.lastNavigation = "home";
      router.replace("/home");
    } catch (error) {
      console.error("Failed to navigate to home:", error);
    }
  }

  resetNavigation() {
    this.lastNavigation = null;
  }
}

export const navigationService = NavigationService.getInstance();
