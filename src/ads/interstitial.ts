// AdMob 전면(인터스티셜) 광고 스텁.
//
// TWA로 Android 래핑하거나 React Native로 전환할 때 이 함수만 실제 SDK
// 호출로 채워주면 된다. 호출부는 Promise로 await 하므로 광고 종료 후
// 화면 전환이 자연스럽게 이어진다.
//
// 통합 시 예시 (web AdSense):
//   await window.googletag.cmd.push(() => { /* show interstitial */ });
//
// 통합 시 예시 (React Native + AdMob):
//   import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
//   const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);
//   ad.load();
//   await new Promise(resolve => {
//     ad.addAdEventListener(AdEventType.CLOSED, resolve);
//     ad.addAdEventListener(AdEventType.ERROR, resolve);
//     ad.show();
//   });
//
// 광고 노출 빈도 제한이 필요하면 여기서 localStorage 타임스탬프 체크 가능.

export async function showInterstitialAd(): Promise<void> {
  if (import.meta.env.DEV) {
    console.log('[ads] showInterstitialAd() — 스텁 호출됨');
  }
  // 실제 SDK 호출로 교체하세요.
  return Promise.resolve();
}
