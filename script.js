// script.js

// DOMContentLoaded: HTMLの読み込みが完了したらスクリプトを実行
document.addEventListener('DOMContentLoaded', () => {
    // フォームとレビューリストの要素を取得
    const postReviewForm = document.getElementById('post-review-form');
    const reviewTitleInput = document.getElementById('review-title');
    const reviewContentInput = document.getElementById('review-content');
    const reviewsContainer = document.getElementById('reviews-container');
    const colorPicker = document.getElementById('color-picker');

    // ハンバーガーメニュー関連の要素を取得
    const hamburgerToggle = document.querySelector('.hamburger-menu-toggle');
    const mainNav = document.querySelector('.main-nav');


    // ハンバーガーメニューの開閉イベントリスナー
    hamburgerToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active'); // active クラスの付け外し
        hamburgerToggle.classList.toggle('active'); // ハンバーガーアイコンの見た目変更用
    });

    // ユーザーIDをシミュレート（実際はログイン機能で管理）
    const currentUserId = 'user_' + Math.random().toString(36).substring(2, 9); // シンプルな一時ユーザーID


    // 既存のレビューを読み込む (もしあれば)
    loadReviews();

    // フォームが送信されたときの処理
    postReviewForm.addEventListener('submit', (event) => {
        event.preventDefault(); // フォームのデフォルトの送信動作をキャンセル

        const title = reviewTitleInput.value.trim(); // 前後の空白を削除
        const content = reviewContentInput.value.trim(); // 前後の空白を削除
        const selectedColorInput = colorPicker.querySelector('input[name="sticker-color"]:checked');
        const selectedColor = selectedColorInput ? selectedColorInput.value : '#A8DDA8'; // ★変更: デフォルト色をライトグリーンに変更★


        // 入力値の簡易的な検証 (空でないことを確認)
        if (!title || !content) {
            alert('タイトルと内容を入力してください。');
            return; // 処理を中断
        }

        // 新しいレビューオブジェクトを作成
        const now = new Date();
        const newReview = {
            id: Date.now().toString(), // レビューを一意に識別するID
            title: title,
            content: content,
            dateTime: now.toLocaleDateString('ja-JP') + ' ' + now.toLocaleTimeString('ja-JP', {hour: '2-digit', minute:'2-digit'}),
            color: selectedColor,
            likes: 0, // いいね数
            likedBy: [] // いいねしたユーザーのIDを保存する配列
        };

        // レビューを保存
        saveReview(newReview);

        // レビューを表示
        addReviewToDOM(newReview);

        // フォームをクリア
        reviewTitleInput.value = '';
        reviewContentInput.value = '';
        document.getElementById('color1').checked = true; // 色選択をデフォルトに戻す
    });

    /**
     * テキスト内のHTML特殊文字をエスケープする関数
     * クロスサイトスクリプティング (XSS) 対策
     * @param {string} text - エスケープ対象の文字列
     * @returns {string} エスケープされた文字列
     */
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    /**
     * 新しいレビューをDOMに追加して表示する関数
     * @param {object} review - 追加するレビューオブジェクト
     */
    function addReviewToDOM(review) {
        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item'); // CSSクラスを追加

        // レビューの色を設定
        reviewItem.style.backgroundColor = review.color;

        // エスケープされたタイトルと内容を安全に表示
        reviewItem.innerHTML = `
            <h3>${escapeHTML(review.title)}</h3>
            <p>${escapeHTML(review.content)}</p>
            <div class="review-footer">
                <small>投稿日: ${review.dateTime}</small>
                <button class="like-button" data-review-id="${review.id}">
                    <span class="like-icon"></span> <span class="like-count">${review.likes}</span>
                </button>
            </div>
        `;

        // いいねボタンの参照を取得し、イベントリスナーを設定
        const likeButton = reviewItem.querySelector(`.like-button[data-review-id="${review.id}"]`);
        const likeCountSpan = likeButton.querySelector('.like-count');

        // いいね済みかどうかの状態を初期化
        if (review.likedBy && review.likedBy.includes(currentUserId)) {
            likeButton.classList.add('liked');
        }

        likeButton.addEventListener('click', () => {
            handleLikeButtonClick(review.id, likeButton, likeCountSpan);
        });

        // 付箋をランダムに少し回転させる
        const randomRotation = (Math.random() * 6) - 3; // -3度から+3度の範囲
        reviewItem.style.setProperty('--rotation-offset', randomRotation);

        // レビューリストの先頭に追加 (新しいものが上に来るように)
        reviewsContainer.prepend(reviewItem);
    }

    /**
     * いいねボタンがクリックされたときの処理
     * @param {string} reviewId - いいねされたレビューのID
     * @param {HTMLElement} buttonElement - いいねボタンのHTML要素
     * @param {HTMLElement} countElement - いいね数を表示するHTML要素
     */
    function handleLikeButtonClick(reviewId, buttonElement, countElement) {
        let reviews = JSON.parse(localStorage.getItem('aiReviews')) || [];
        const reviewIndex = reviews.findIndex(r => r.id === reviewId);

        if (reviewIndex > -1) {
            const review = reviews[reviewIndex];
            const hasLiked = review.likedBy.includes(currentUserId);

            if (hasLiked) {
                // いいねを解除
                review.likes--;
                review.likedBy = review.likedBy.filter(id => id !== currentUserId);
                buttonElement.classList.remove('liked');
            } else {
                // いいね
                review.likes++;
                review.likedBy.push(currentUserId);
                buttonElement.classList.add('liked');
            }

            countElement.textContent = review.likes; // 表示を更新
            localStorage.setItem('aiReviews', JSON.stringify(reviews)); // localStorageを更新
        }
    }

    /**
     * レビューをlocalStorageに保存する関数
     * @param {object} review - 保存するレビューオブジェクト
     */
    function saveReview(review) {
        let reviews = JSON.parse(localStorage.getItem('aiReviews')) || [];
        // 新しいレビューは常に配列の先頭に追加
        reviews.unshift(review);
        localStorage.setItem('aiReviews', JSON.stringify(reviews));
    }

    /**
     * localStorageからレビューを読み込み、表示する関数
     */
    function loadReviews() {
            let reviews = JSON.parse(localStorage.getItem('aiReviews')) || [];
        // ★変更点: レビューを逆順にしてからforEachで回す★
        // 最新のレビューがlocalStorage配列の先頭にあるため、
        // そのままforEachすると古い順になる。
        // reverse()で配列の順序を反転させ、新しいものからDOMに追加されるようにする。
        reviews.reverse().forEach(review => {
            addReviewToDOM(review);
        });
    }
});
