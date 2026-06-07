import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // ✅ 1. URLCache 설정 (메모리 4MB, 디스크 20MB)
        // 용량을 적게 잡아 구버전 웹 리소스가 오래 남지 않도록 합니다.
        let memoryCapacity = 4 * 1024 * 1024   // 4 MB
        let diskCapacity   = 20 * 1024 * 1024  // 20 MB
        URLCache.shared = URLCache(memoryCapacity: memoryCapacity,
                                   diskCapacity: diskCapacity,
                                   diskPath: "kuji_url_cache")

        // ✅ 2. 앱 시작 시 웹 캐시 전체 삭제 (항상 최신 빌드 로드)
        URLCache.shared.removeAllCachedResponses()

        // ✅ 3. 앱 아이콘 배지 초기화
        application.applicationIconBadgeNumber = 0

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // ✅ 백그라운드 진입 시 메모리 캐시만 비움 (디스크는 유지)
        URLCache.shared.removeAllCachedResponses()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // ✅ 포그라운드 복귀 시 배지 초기화
        UIApplication.shared.applicationIconBadgeNumber = 0
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
           let url = userActivity.webpageURL {
            _ = ApplicationDelegateProxy.shared.application(application, open: url, options: [:])
        }
        return true
    }

}
