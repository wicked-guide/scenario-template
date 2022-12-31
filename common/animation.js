//コンポーネントの定義
Vue.component("animation", {
  template: `
  <section class="wapper">
  <!-- 左メニュー ：ページ遷移-->
  <nav class="contentIndex">
    <button @click="showContent=!showContent">&equiv;</button>
    <ul v-show="showContent">
      <li v-for="link in links" :class="{active:link.id==param}">
        <a :href="'index.html?'+link.id">{{link.name}}</a>
      </li>
    </ul>
  </nav>

  <!-- メイン -->
  <main>
    <!-- スライド -->
    <section class="slidearea">
      <img :src="slideSrc" alt="slide" class="slide" />
    </section>

    <!-- メッセージエリア -->
    <section class="messagearea">
      <section class="messagemenu">
        <!-- アクター -->
        <div class="actor" :class="{none:actorSrc=='unknown'}">
          {{actorSrc}}
        </div>
        <!-- メニュー -->
        <button
          class="mlauto"
          :class="isVoice ? 'btnon' : 'btnoff'"
          @click="switchVoice"
        >
          <span>音声</span>
          <span class="icon">&#9835;</span>
        </button>
        <button
          :class="isAuto ? 'btnon' : 'btnoff'"
          @click="switchAuto()"
        >
          <span>自動</span>
          <span class="icon">&#x23CE;</span>
        </button>
        <button @click="messageVoice.pause();">
          <span>停止</span>
          <span class="icon">&#9632;</span>
        </button>
        <button class="">
          <span @click="replay();">もう一度</span>
          <span class="icon">&#9658;</span>
        </button>
      </section>

      <!-- メッセージウィンドウ -->
      <section class="messagewindow" @click="next">
        <div class="messagetext">
          <span>{{messageSrc}}</span>
        </div>
      </section>
    </section>
  </main>

  <!-- 右メニュー：もくじ -->
  <nav class="navIndex">
    <button @click="showIndex=!showIndex">&equiv;</button>
    <ul v-show="showIndex">
      <li
        v-for="(s,i) in scenario"
        @click="pageJump(i)"
        :class="{active:i==pageIndex}"
      >
        {{s.title}}
      </li>
    </ul>
  </nav>
</section>
  `,
  data() {
    return {
      // パラメータ取得
      param: location.search.replace("?", ""),
      // 左メニュー
      links: [],
      showContent: false, //リンクメニュー表示
      showIndex: true, //もくじ表示
      // シナリオ制御
      scenario: [],
      pageIndex: 0,
      messageIndex: 0,
      isVoice: true,
      isAuto: true,
      messageVoice: new Audio(""),
    };
  },
  mounted() {
    // リンクを取得
    const linkUrl = "link.json";
    fetch(linkUrl)
      .then((response) => response.json())
      .then((data) => {
        this.links = data;
      })
      .catch((error) => {
        console.error("リンクがありません");
      });
    // シナリオを取得
    if (!this.param) {
      this.param = "01";
    }
    const scenarioUrl = this.param + "/scenario.json";
    fetch(scenarioUrl)
      .then((response) => response.json())
      .then((data) => {
        this.scenario = data;
      })
      .catch((error) => {
        console.error("シナリオがありません");
      });
  },
  computed: {
    slideSrc() {
      try {
        const src =
          this.param +
          "/img/" +
          this.scenario[this.pageIndex].message[this.messageIndex].slide;
        if (!src) {
          return "common/img/cloud1.png";
        } else {
          return src;
        }
      } catch {
        return "common/img/cloud1.png";
      }
    },
    messageSrc() {
      try {
        return this.scenario[this.pageIndex].message[this.messageIndex].text;
      } catch {
        return "LAST";
      }
    },
    actorSrc() {
      try {
        if (this.scenario[this.pageIndex].message[this.messageIndex].actor) {
          return this.scenario[this.pageIndex].message[this.messageIndex].actor;
        } else {
          return "unknown";
        }
      } catch {
        return "unknown";
      }
    },
  },
  methods: {
    // ページジャンプ
    pageJump(index) {
      this.messageVoice.pause();
      this.pageIndex = index;
      this.messageIndex = 0;
      this.voicePlay();
    },

    // ページ送り
    next() {
      this.messageVoice.pause();
      this.messageIndex++;
      if (this.messageSrc == "LAST") {
        // 最後なら停止
        if (this.pageIndex + 1 == this.scenario.length) {
          this.messageIndex--;
          return;
        }
        this.pageIndex++;
        this.messageIndex = 0;
      }
      this.voicePlay();
    },

    // 音声再生
    voicePlay() {
      this.messageVoice.pause();

      if (this.isVoice) {
        this.messageVoice = new Audio(
          this.param +
            "/sound/" +
            this.scenario[this.pageIndex].message[this.messageIndex].voice
        );
        this.messageVoice.play();

        // オートスキップ
        this.messageVoice.addEventListener("ended", () => {
          if (this.isAuto) {
            this.next();
          }
        });
      }
    },

    // リプレイ
    replay() {
      this.messageVoice.pause();
      this.messageVoice.currentTime = 0;
      this.messageVoice.play();
    },

    // スイッチ
    switchVoice() {
      this.isVoice = !this.isVoice;
      if (!this.isVoice) {
        this.isAuto = false;
      }
    },
    switchAuto() {
      this.isAuto = !this.isAuto;
      if (this.isAuto) {
        this.isVoice = true;
      }
    },
  },
});
