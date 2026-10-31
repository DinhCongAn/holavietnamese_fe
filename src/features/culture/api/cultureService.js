// Culture Exploration Service (Người 4: /culture & /culture/:id)

import axiosClient from '../../../shared/api/axiosClient.js';

export const CULTURE_CATEGORIES = [
  { id: 'all', label: 'Tất cả danh mục', labelVi: 'Tất cả danh mục', labelEn: 'All Categories' },
  { id: 'culinary', label: 'Ẩm thực', labelVi: 'Ẩm thực', labelEn: 'Food & Cuisine' },
  { id: 'tradition', label: 'Lễ hội & Phong tục', labelVi: 'Lễ hội & Phong tục', labelEn: 'Festivals & Traditions' },
  { id: 'daily-life', label: 'Đời sống thường nhật', labelVi: 'Đời sống thường nhật', labelEn: 'Daily Life' },
  { id: 'art', label: 'Nghệ thuật & Di sản', labelVi: 'Nghệ thuật & Di sản', labelEn: 'Arts & Heritage' },
  { id: 'travel-spots', label: 'Danh lam & Điểm đến', labelVi: 'Danh lam & Điểm đến', labelEn: 'Destinations & Sights' },
];

export const CULTURE_DESTINATIONS = [
  { id: 'all', label: 'Toàn quốc', labelVi: 'Toàn quốc', labelEn: 'Nationwide' },
  { id: 'hanoi', label: 'Hà Nội', labelVi: 'Hà Nội', labelEn: 'Hanoi' },
  { id: 'hue', label: 'Huế', labelVi: 'Huế', labelEn: 'Hue' },
  { id: 'hoian', label: 'Hội An', labelVi: 'Hội An', labelEn: 'Hoi An' },
  { id: 'hcmc', label: 'TP. Hồ Chí Minh', labelVi: 'TP. Hồ Chí Minh', labelEn: 'Ho Chi Minh City' },
  { id: 'mientay', label: 'Miền Tây', labelVi: 'Miền Tây', labelEn: 'Mekong Delta' },
  { id: 'sapa', label: 'Sa Pa', labelVi: 'Sa Pa', labelEn: 'Sa Pa' },
  { id: 'danang', label: 'Đà Nẵng', labelVi: 'Đà Nẵng', labelEn: 'Da Nang' },
];

export const CULTURE_ARTICLES = [
  {
    id: 'van-hoa-ca-phe-viet-nam',
    title: 'Văn hóa cà phê Việt Nam: Từ Cà phê phin đến Cà phê trứng nức tiếng',
    titleVi: 'Văn hóa cà phê Việt Nam: Từ Cà phê phin đến Cà phê trứng nức tiếng',
    titleEn: 'Vietnamese Coffee Culture: From Drip Phin to Renowned Egg Coffee',
    subtitle: 'Nét văn hóa vỉa hè thong thả và cách người Việt thưởng thức từng giọt đắng thơm nồng',
    subtitleVi: 'Nét văn hóa vỉa hè thong thả và cách người Việt thưởng thức từng giọt đắng thơm nồng',
    subtitleEn: 'Relaxed sidewalk culture and how Vietnamese people savour every aromatic drop',
    category: 'daily-life',
    categoryName: 'Đời sống thường nhật',
    categoryNameVi: 'Đời sống thường nhật',
    categoryNameEn: 'Daily Life',
    destination: 'hanoi',
    destinationName: 'Hà Nội',
    destinationNameVi: 'Hà Nội',
    destinationNameEn: 'Hanoi',
    readTime: '6 phút đọc',
    readTimeVi: '6 phút đọc',
    readTimeEn: '6 min read',
    publishedDate: '15/03/2026',
    author: 'Nguyễn Thanh Thảo',
    authorRole: 'Nhà nghiên cứu văn hóa ẩm thực',
    authorRoleVi: 'Nhà nghiên cứu văn hóa ẩm thực',
    authorRoleEn: 'Culinary Culture Researcher',
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    summary: 'Cà phê tại Việt Nam không chỉ là một thức uống giúp tỉnh táo buổi sáng, mà là cả một phong cách sống thong dong, một không gian kết nối bạn bè và một di sản ẩm thực độc đáo vươn tầm thế giới.',
    summaryVi: 'Cà phê tại Việt Nam không chỉ là một thức uống giúp tỉnh táo buổi sáng, mà là cả một phong cách sống thong dong, một không gian kết nối bạn bè và một di sản ẩm thực độc đáo vươn tầm thế giới.',
    summaryEn: 'Coffee in Vietnam is not just a morning wake-up drink, but a leisurely lifestyle, a communal space to connect with friends, and a unique culinary heritage celebrated worldwide.',
    contentVi: `### ☕ Câu chuyện về chiếc phin cà phê chậm rãi

Người Pháp mang cây cà phê vào Việt Nam từ giữa thế kỷ 19, nhưng chính người Việt đã sáng tạo nên cách uống bằng **phin kim loại** – chiếc phin nhôm nhỏ nhắn đặt lên trên chiếc ly thủy tinh chứa sẵn lớp sữa đặc ngọt béo.

Từng giọt cà phê tí tách rơi xuống đòi hỏi người thưởng thức phải kiên nhẫn. Người Việt Nam không uống cà phê vội vã để mang đi (to-go), mà thích ngồi xuống chiếc ghế đẩu con con ven đường, ngắm phố xá chuyển mình và đàm đạo cùng bạn bè.

---

### 🥚 Sự ra đời kỳ diệu của "Cà phê trứng" Hà Nội

Vào những năm 1940 trong thời kỳ kháng chiến thiếu thốn sữa đặc, cụ Giảng – một chuyên gia pha chế tại khách sạn Metropole Hà Nội – đã nảy ra ý tưởng táo bạo: dùng **lòng đỏ trứng gà đánh bông** để tạo lớp bọt kem sánh mịn béo ngậy thay thế cho sữa.

Thức uống này ngày nay đã trở thành huyền thoại ẩm thực của thủ đô Hà Nội. Lớp kem trứng vàng ươm, ngọt thanh, thơm mùi vani hòa quyện hoàn hảo với vị đắng đậm đà của cà phê Robusta bên dưới, tạo nên trải nghiệm khó quên cho bất kỳ du khách nào.

---

### 🛵 Cà phê bệt Sài Gòn & Cà phê vợt xưa

Nếu Hà Nội chuộng cà phê phin trầm mặc trong ngõ nhỏ, thì Sài Gòn lại sôi động với **"cà phê bệt"** dưới tán cây công viên 30/4 hay những quán **cà phê vợt** đỏ lửa thâu đêm suốt sáng hơn nửa thế kỷ qua.

Uống cà phê ở Việt Nam là một cách tuyệt vời để bạn thực hành tiếng Việt: chỉ cần gọi *"Cho em một ly cà phê sữa đá, ít ngọt!"* là bạn đã hòa mình trọn vẹn vào nhịp đập của xứ sở này rồi!`,
    contentEn: `### ☕ The Story of the Slow-Drip Phin

The French brought coffee plants to Vietnam in the mid-19th century, but it was the Vietnamese who invented the **metal drip phin**—a small aluminum filter resting atop a glass already layered with thick, sweet condensed milk.

Each drop falling slowly requires patience. Vietnamese people do not rush coffee to-go; they prefer sitting on small roadside stools, watching city life unfold, and chatting with friends.

---

### 🥚 The Miraculous Birth of Hanoi "Egg Coffee"

In the 1940s during wartime shortages of condensed milk, Mr. Giang—a bartender at the Metropole Hotel in Hanoi—came up with an ingenious idea: using **whipped egg yolks** to create a luscious, velvety cream foam to replace milk.

Today, this beverage has become a legendary culinary treasure of Hanoi. The golden, fragrant egg foam harmonizes perfectly with the bold bitterness of Robusta coffee below, creating an unforgettable experience.

---

### 🛵 Saigon Sidewalk & Ancient Cloth-Filter Coffee

While Hanoi favors contemplative phin coffee in quiet alleys, Saigon is vibrant with **"park sidewalk coffee"** under the shade of trees or traditional **cloth-filter coffee stalls** burning red coals around the clock for over half a century.

Drinking coffee in Vietnam is a great way to practice your Vietnamese: simply order *"Cho em một ly cà phê sữa đá, ít ngọt!"* and you are immersed in the pulse of the nation!`,
    content: `### ☕ Câu chuyện về chiếc phin cà phê chậm rãi

Người Pháp mang cây cà phê vào Việt Nam từ giữa thế kỷ 19, nhưng chính người Việt đã sáng tạo nên cách uống bằng **phin kim loại** – chiếc phin nhôm nhỏ nhắn đặt lên trên chiếc ly thủy tinh chứa sẵn lớp sữa đặc ngọt béo.

Từng giọt cà phê tí tách rơi xuống đòi hỏi người thưởng thức phải kiên nhẫn. Người Việt Nam không uống cà phê vội vã để mang đi (to-go), mà thích ngồi xuống chiếc ghế đẩu con con ven đường, ngắm phố xá chuyển mình và đàm đạo cùng bạn bè.

---

### 🥚 Sự ra đời kỳ diệu của "Cà phê trứng" Hà Nội

Vào những năm 1940 trong thời kỳ kháng chiến thiếu thốn sữa đặc, cụ Giảng – một chuyên gia pha chế tại khách sạn Metropole Hà Nội – đã nảy ra ý tưởng táo bạo: dùng **lòng đỏ trứng gà đánh bông** để tạo lớp bọt kem sánh mịn béo ngậy thay thế cho sữa.

Thức uống này ngày nay đã trở thành huyền thoại ẩm thực của thủ đô Hà Nội. Lớp kem trứng vàng ươm, ngọt thanh, thơm mùi vani hòa quyện hoàn hảo với vị đắng đậm đà của cà phê Robusta bên dưới, tạo nên trải nghiệm khó quên cho bất kỳ du khách nào.

---

### 🛵 Cà phê bệt Sài Gòn & Cà phê vợt xưa

Nếu Hà Nội chuộng cà phê phin trầm mặc trong ngõ nhỏ, thì Sài Gòn lại sôi động với **"cà phê bệt"** dưới tán cây công viên 30/4 hay những quán **cà phê vợt** đỏ lửa thâu đêm suốt sáng hơn nửa thế kỷ qua.

Uống cà phê ở Việt Nam là một cách tuyệt vời để bạn thực hành tiếng Việt: chỉ cần gọi *"Cho em một ly cà phê sữa đá, ít ngọt!"* là bạn đã hòa mình trọn vẹn vào nhịp đập của xứ sở này rồi!`,
    usefulPhrases: [
      {
        word: 'Cà phê phin',
        pronunciation: 'kà-phê-phin',
        meaning: 'Traditional Vietnamese drip filter coffee',
        context: 'Dùng khi muốn gọi cà phê pha bằng phin truyền thống.',
      },
      {
        word: 'Cà phê sữa đá',
        pronunciation: 'kà-phê-sữa-đá',
        meaning: 'Iced coffee with sweetened condensed milk',
        context: 'Thức uống quốc dân phổ biến nhất ở miền Nam.',
      },
      {
        word: 'Cà phê trứng',
        pronunciation: 'kà-phê-trứng',
        meaning: 'Hanoi specialty egg coffee with whipped egg yolk',
        context: 'Đặc sản trứ danh của Hà Nội, thường uống nóng.',
      },
      {
        word: 'Cà phê bệt',
        pronunciation: 'kà-phê-bệt',
        meaning: 'Sidewalk/park coffee sitting on newspaper sheets on the ground',
        context: 'Nét văn hóa trẻ trung, phóng khoáng tại TP. Hồ Chí Minh.',
      },
      {
        word: 'Ít ngọt / Ít đá',
        pronunciation: 'ít-ngọt / ít-đá',
        meaning: 'Less sweet / Less ice',
        context: 'Dùng để dặn người bán pha chế theo khẩu vị riêng.',
      },
    ],
    relatedArticles: ['bi-quyet-pho-ha-noi', 'van-hoa-xe-may-sai-gon'],
  },
  {
    id: 'bi-quyet-pho-ha-noi',
    title: 'Bí quyết thưởng thức Phở chuẩn vị Hà Nội và văn hóa ẩm thực Tràng An',
    titleVi: 'Bí quyết thưởng thức Phở chuẩn vị Hà Nội và văn hóa ẩm thực Tràng An',
    titleEn: 'Secrets of Authentic Hanoi Pho & Culinary Culture of Trang An',
    subtitle: 'Nồi nước dùng ninh từ xương bò, bánh phở mềm mướt và phong vị tao nhã của người Hà Thành',
    subtitleVi: 'Nồi nước dùng ninh từ xương bò, bánh phở mềm mướt và phong vị tao nhã của người Hà Thành',
    subtitleEn: 'Beef bone broth simmered for hours, silky rice noodles, and the refined taste of Hanoi locals',
    category: 'culinary',
    categoryName: 'Ẩm thực',
    categoryNameVi: 'Ẩm thực',
    categoryNameEn: 'Food & Cuisine',
    destination: 'hanoi',
    destinationName: 'Hà Nội',
    destinationNameVi: 'Hà Nội',
    destinationNameEn: 'Hanoi',
    readTime: '5 phút đọc',
    readTimeVi: '5 phút đọc',
    readTimeEn: '5 min read',
    publishedDate: '18/03/2026',
    author: 'Vũ Bằng',
    authorRole: 'Nhà báo chuyên mục ẩm thực',
    authorRoleVi: 'Nhà báo chuyên mục ẩm thực',
    authorRoleEn: 'Culinary Journalist',
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1200&q=80',
    summary: 'Phở không chỉ là món ăn biểu tượng của Việt Nam trên bản đồ thế giới, mà còn mang trọn cốt cách tao nhã, tinh tế và sự kỹ tính của người Tràng An.',
    summaryVi: 'Phở không chỉ là món ăn biểu tượng của Việt Nam trên bản đồ thế giới, mà còn mang trọn cốt cách tao nhã, tinh tế và sự kỹ tính của người Tràng An.',
    summaryEn: 'Pho is not only Vietnam’s iconic culinary ambassador on the world map, but also embodies the elegance, subtlety, and meticulous palate of Hanoi.',
    contentVi: `### 🍲 Nước dùng - Linh hồn của bát phở

Một bát phở chuẩn vị Hà Nội trước hết phải có nồi nước dùng trong vắt nhưng ngọt đậm từ xương ống bò ninh kỹ từ 10 đến 12 tiếng. Hương thơm thoang thoảng của gừng nướng, hành nướng, hoa hồi, quế chi và thảo quả quyện vào nhau tạo nên một bản giao hưởng khứu giác khó cưỡng.

Người Hà Nội sành ăn không thích nước dùng nhiều mỡ màng hay lạm dụng hạt nêm, đường; vị ngọt phải thanh thoát, dịu êm và đọng lại nơi cuống họng.

---

### 🥢 Tái hay Chín? Nạc hay Gầu?

Khi bước vào quán phở truyền thống ở phố Hàng Đồng hay Bát Đàn, bạn sẽ nghe những âm thanh rộn rã:
- *"Cho một bát tái nạm, nhiều hành ít bánh!"*
- *"Một bát gầu giòn, thêm hai chiếc quẩy giòn và chén trứng chần!"*

Thịt bò tái được dần mỏng, trần vừa chín tới giữ trọn độ mọng nước ngọt ngào; trong khi thịt chín hay nạm lại thơm bùi, đậm đà gia vị.

---

### 🍋 Dấm tỏi hay Chanh?

Người Hà Nội xưa thường ăn phở với **dấm tỏi ớt ngâm** thay vì vắt chanh, bởi vị chua thanh của dấm không làm át đi hương thơm tự nhiên của nước dùng bò. Hãy thử một lần thưởng thức phở với vài giọt tương ớt cay nồng tự làm và lát tỏi ngâm giòn rụm!`,
    contentEn: `### 🍲 The Broth - The Soul of Pho

A bowl of authentic Hanoi pho must start with a pot of crystal-clear broth deeply simmered from beef marrow bones for 10 to 12 hours. The delicate aroma of charred ginger, roasted shallots, star anise, cinnamon, and black cardamom weaves together into an irresistible olfactory symphony.

Discerning Hanoi food lovers reject greasy broth or heavy seasonings; the sweetness must be pure, soothing, and lingering.

---

### 🥢 Rare or Well-Done? Lean or Flank?

Stepping into an old-fashioned pho stall on Hang Dong or Bat Dan street, you will hear lively orders:
- *"Cho một bát tái nạm, nhiều hành ít bánh!"* (Rare and flank beef, extra scallions, less noodles!)
- *"Một bát gầu giòn, thêm hai chiếc quẩy giòn và chén trứng chần!"* (Crispy brisket with fried dough sticks and poached egg!)

---

### 🍋 Garlic Vinegar vs Fresh Lime

Hanoi purists traditionally enjoy pho with **pickled garlic vinegar** instead of lime, ensuring the sour tang never masks the natural beef aroma. Try adding a dash of homemade chili sauce with crispy pickled garlic!`,
    content: `### 🍲 Nước dùng - Linh hồn của bát phở

Một bát phở chuẩn vị Hà Nội trước hết phải có nồi nước dùng trong vắt nhưng ngọt đậm từ xương ống bò ninh kỹ từ 10 đến 12 tiếng. Hương thơm thoang thoảng của gừng nướng, hành nướng, hoa hồi, quế chi và thảo quả quyện vào nhau tạo nên một bản giao hưởng khứu giác khó cưỡng.

Người Hà Nội sành ăn không thích nước dùng nhiều mỡ màng hay lạm dụng hạt nêm, đường; vị ngọt phải thanh thoát, dịu êm và đọng lại nơi cuống họng.

---

### 🥢 Tái hay Chín? Nạc hay Gầu?

Khi bước vào quán phở truyền thống ở phố Hàng Đồng hay Bát Đàn, bạn sẽ nghe những âm thanh rộn rã:
- *"Cho một bát tái nạm, nhiều hành ít bánh!"*
- *"Một bát gầu giòn, thêm hai chiếc quẩy giòn và chén trứng chần!"*

Thịt bò tái được dần mỏng, trần vừa chín tới giữ trọn độ mọng nước ngọt ngào; trong khi thịt chín hay nạm lại thơm bùi, đậm đà gia vị.

---

### 🍋 Dấm tỏi hay Chanh?

Người Hà Nội xưa thường ăn phở với **dấm tỏi ớt ngâm** thay vì vắt chanh, bởi vị chua thanh của dấm không làm át đi hương thơm tự nhiên của nước dùng bò. Hãy thử một lần thưởng thức phở với vài giọt tương ớt cay nồng tự làm và lát tỏi ngâm giòn rụm!`,
    usefulPhrases: [
      {
        word: 'Nước dùng trong',
        pronunciation: 'nước-dùng-chong',
        meaning: 'Clear broth',
        context: 'Đặc trưng cốt lõi của phở Hà Nội.',
      },
      {
        word: 'Phở bò tái chín',
        pronunciation: 'phở-bò-tái-chín',
        meaning: 'Beef pho with both rare and well-done beef',
        context: 'Lựa chọn phổ biến nhất khi lần đầu gọi phở.',
      },
      {
        word: 'Quẩy giòn',
        pronunciation: 'quẩy-giòn',
        meaning: 'Crispy fried dough sticks',
        context: 'Món ăn kèm nhúng vào nước phở cực kỳ hấp dẫn.',
      },
      {
        word: 'Dấm tỏi',
        pronunciation: 'dấm-tỏi',
        meaning: 'Garlic-infused vinegar condiment',
        context: 'Gia vị truyền thống ăn kèm phở tại miền Bắc.',
      },
    ],
    relatedArticles: ['van-hoa-ca-phe-viet-nam', 'nghe-thuat-xung-ho-viet-nam'],
  },
  {
    id: 'nghe-thuat-xung-ho-viet-nam',
    title: 'Nghệ thuật xưng hô trong gia đình và xã hội Việt Nam: Tinh tế và tôn ti',
    titleVi: 'Nghệ thuật xưng hô trong gia đình và xã hội Việt Nam: Tinh tế và tôn ti',
    titleEn: 'The Art of Vietnamese Pronouns: Etiquette, Family & Social Harmony',
    subtitle: 'Khám phá thế giới đại từ nhân xưng phong phú bậc nhất thế giới và ý nghĩa đằng sau',
    subtitleVi: 'Khám phá thế giới đại từ nhân xưng phong phú bậc nhất thế giới và ý nghĩa đằng sau',
    subtitleEn: 'Explore one of the richest kinship-based pronoun systems in the world and the deep culture behind it',
    category: 'tradition',
    categoryName: 'Lễ hội & Phong tục',
    categoryNameVi: 'Lễ hội & Phong tục',
    categoryNameEn: 'Festivals & Traditions',
    destination: 'all',
    destinationName: 'Toàn quốc',
    destinationNameVi: 'Toàn quốc',
    destinationNameEn: 'Nationwide',
    readTime: '7 phút đọc',
    readTimeVi: '7 phút đọc',
    readTimeEn: '7 min read',
    publishedDate: '20/03/2026',
    author: 'TS. Lê Hoàng Mai',
    authorRole: 'Giảng viên ngôn ngữ học',
    authorRoleVi: 'Giảng viên ngôn ngữ học',
    authorRoleEn: 'Linguistics Lecturer',
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    summary: 'Nếu như tiếng Anh chỉ có "I" và "You", thì tiếng Việt có hàng chục cách xưng hô phản ánh tuổi tác, mối quan hệ, cấp bậc và tình cảm yêu thương.',
    summaryVi: 'Nếu như tiếng Anh chỉ có "I" và "You", thì tiếng Việt có hàng chục cách xưng hô phản ánh tuổi tác, mối quan hệ, cấp bậc và tình cảm yêu thương.',
    summaryEn: 'While English relies simply on "I" and "You", Vietnamese offers dozens of pronouns reflecting age, relational hierarchy, and affection.',
    contentVi: `### 👨‍👩‍👧‍👦 Xã hội như một gia đình mở rộng

Trong văn hóa Việt Nam, toàn bộ xã hội được nhìn nhận như một đại gia đình. Do đó, người lạ khi gặp nhau cũng ngay lập tức định vị tuổi tác để gọi nhau bằng:
- **Anh / Chị**: Người lớn hơn mình vài tuổi
- **Em**: Người nhỏ tuổi hơn mình
- **Cô / Chú / Bác**: Người bằng tuổi cha mẹ mình
- **Ông / Bà**: Người lớn tuổi thế hệ ông bà

---

### 🙏 Chữ "Dạ" và "Ạ" - Đỉnh cao của sự lễ phép

Trong tiếng Việt, một người ngoại quốc nói được chữ **"Dạ"** mở đầu và chữ **"ạ"** kết câu với người lớn tuổi sẽ nhận được nụ cười cảm tình và sự yêu mến tức thì từ người bản xứ:
> *"Dạ, con cảm ơn cô ạ!"*  
> *"Dạ, cháu chào bác ạ!"*

Đây không chỉ là ngữ pháp, mà là nhịp cầu văn hóa thể hiện sự khiêm nhường, kính cẩn.`,
    contentEn: `### 👨‍👩‍👧‍👦 Society as an Extended Family

In Vietnamese culture, society is perceived as one large extended family. Strangers immediately gauge ages to address one another warmly:
- **Anh / Chị**: Older brother / sister (a few years older)
- **Em**: Younger sibling (younger than you)
- **Cô / Chú / Bác**: Aunt / Uncle (parents’ generation)
- **Ông / Bà**: Grandfather / Grandmother generation

---

### 🙏 "Dạ" and "Ạ" - The Pinnacle of Politeness

When a foreigner opens a sentence with **"Dạ"** and ends with **"ạ"** when speaking to elders, they instantly receive warm smiles and affection:
> *"Dạ, con cảm ơn cô ạ!"* (Yes, thank you auntie!)  
> *"Dạ, cháu chào bác ạ!"* (Yes, hello uncle!)

This is not mere grammar—it is a cultural bridge expressing humility and respect.`,
    content: `### 👨‍👩‍👧‍👦 Xã hội như một gia đình mở rộng

Trong văn hóa Việt Nam, toàn bộ xã hội được nhìn nhận như một đại gia đình. Do đó, người lạ khi gặp nhau cũng ngay lập tức định vị tuổi tác để gọi nhau bằng:
- **Anh / Chị**: Người lớn hơn mình vài tuổi
- **Em**: Người nhỏ tuổi hơn mình
- **Cô / Chú / Bác**: Người bằng tuổi cha mẹ mình
- **Ông / Bà**: Người lớn tuổi thế hệ ông bà

---

### 🙏 Chữ "Dạ" và "Ạ" - Đỉnh cao của sự lễ phép

Trong tiếng Việt, một người ngoại quốc nói được chữ **"Dạ"** mở đầu và chữ **"ạ"** kết câu với người lớn tuổi sẽ nhận được nụ cười cảm tình và sự yêu mến tức thì từ người bản xứ:
> *"Dạ, con cảm ơn cô ạ!"*  
> *"Dạ, cháu chào bác ạ!"*

Đây không chỉ là ngữ pháp, mà là nhịp cầu văn hóa thể hiện sự khiêm nhường, kính cẩn.`,
    usefulPhrases: [
      {
        word: 'Kính trên nhường dưới',
        pronunciation: 'kính-trên-nhường-dưới',
        meaning: 'Respect elders and yield to youngsters',
        context: 'Đạo lý cốt lõi trong giao tiếp người Việt.',
      },
      {
        word: 'Dạ, chào bác ạ',
        pronunciation: 'dạ-chào-bác-ạ',
        meaning: 'Polite greeting to an elder uncle/aunt',
        context: 'Dùng khi chào hỏi người lớn tuổi hơn cha mẹ mình.',
      },
      {
        word: 'Anh / Chị / Em',
        pronunciation: 'anh / chị / em',
        meaning: 'Older brother / Older sister / Younger sibling',
        context: 'Cách xưng hô phổ biến nhất trong đời sống hàng ngày.',
      },
    ],
    relatedArticles: ['phong-tuc-tet-nguyen-dan', 'van-hoa-ca-phe-viet-nam'],
  },
  {
    id: 'phong-tuc-tet-nguyen-dan',
    title: 'Phong tục đón Tết Nguyên Đán: Những điều nên làm và kiêng kỵ để đón lộc',
    titleVi: 'Phong tục đón Tết Nguyên Đán: Những điều nên làm và kiêng kỵ để đón lộc',
    titleEn: 'Lunar New Year (Tet) Customs: Traditions, Good Fortune & Family Reunion',
    subtitle: 'Tết là dịp đoàn viên thiêng liêng nhất, nơi gói trọn ước vọng về một năm mới an khang thịnh vượng',
    subtitleVi: 'Tết là dịp đoàn viên thiêng liêng nhất, nơi gói trọn ước vọng về một năm mới an khang thịnh vượng',
    subtitleEn: 'Tet is the most sacred time of reunion, welcoming prosperity and auspicious beginnings',
    category: 'tradition',
    categoryName: 'Lễ hội & Phong tục',
    categoryNameVi: 'Lễ hội & Phong tục',
    categoryNameEn: 'Festivals & Traditions',
    destination: 'all',
    destinationName: 'Toàn quốc',
    destinationNameVi: 'Toàn quốc',
    destinationNameEn: 'Nationwide',
    readTime: '6 phút đọc',
    readTimeVi: '6 phút đọc',
    readTimeEn: '6 min read',
    publishedDate: '22/03/2026',
    author: 'Trần Gia Bảo',
    authorRole: 'Nhà nghiên cứu phong tục cổ truyền',
    authorRoleVi: 'Nhà nghiên cứu phong tục cổ truyền',
    authorRoleEn: 'Traditional Folklore Researcher',
    isFeatured: false,
    coverImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    summary: 'Tết Nguyên Đán không chỉ là kỳ nghỉ lễ đầu năm mà là thời khắc sum họp linh thiêng của gia đình Việt, với bánh chưng xanh, hoa mai, hoa đào và những phong bao lì xì đỏ may mắn.',
    summaryVi: 'Tết Nguyên Đán không chỉ là kỳ nghỉ lễ đầu năm mà là thời khắc sum họp linh thiêng của gia đình Việt, với bánh chưng xanh, hoa mai, hoa đào và những phong bao lì xì đỏ may mắn.',
    summaryEn: 'Tet is not merely a holiday but the most sacred family reunion in Vietnamese life, adorned with green Chung cakes, apricot and peach blossoms, and lucky red envelopes.',
    contentVi: `### 🌸 Hoa Đào miền Bắc & Hoa Mai miền Nam

Ngày Tết, mỗi gia đình miền Bắc không thể thiếu cành đào phai hay bích đào thắm đượm sắc hồng đón gió xuân se lạnh; còn ở miền Nam, sắc vàng rực rỡ của cành mai biểu trưng cho tài lộc, phú quý và hy vọng ngập tràn.

---

### 🧧 Phong tục mừng tuổi (Lì xì) & Xông đất

Sáng mùng Một Tết, con cháu chúc thọ ông bà, cha mẹ và nhận lại những phong bao lì xì đỏ may mắn tượng trưng cho lời chúc học hành đỗ đạt, hay ăn chóng lớn.

Người đầu tiên bước vào nhà sau thời khắc giao thừa gọi là **người xông đất**, được gia chủ lựa chọn kỹ càng để mang lại vượng khí cho cả năm.`,
    contentEn: `### 🌸 Northern Peach Blossoms & Southern Yellow Apricot

During Tet, Northern homes feature soft pink peach branches welcoming spring breezes, while in the South, vibrant golden apricot blossoms symbolize wealth, prosperity, and radiant hope.

---

### 🧧 Lucky Money (Lì Xì) & First-Footer (Xông Đất)

On the first morning of the New Year, younger generations wish grandparents and parents health and longevity, receiving bright red envelopes symbolizing good fortune and blessing.

The first guest to enter the house after New Year’s Eve is the **first-footer (người xông đất)**, thoughtfully invited to bring auspicious energy for the year.`,
    content: `### 🌸 Hoa Đào miền Bắc & Hoa Mai miền Nam

Ngày Tết, mỗi gia đình miền Bắc không thể thiếu cành đào phai hay bích đào thắm đượm sắc hồng đón gió xuân se lạnh; còn ở miền Nam, sắc vàng rực rỡ của cành mai biểu trưng cho tài lộc, phú quý và hy vọng ngập tràn.

---

### 🧧 Phong tục mừng tuổi (Lì xì) & Xông đất

Sáng mùng Một Tết, con cháu chúc thọ ông bà, cha mẹ và nhận lại những phong bao lì xì đỏ may mắn tượng trưng cho lời chúc học hành đỗ đạt, hay ăn chóng lớn.

Người đầu tiên bước vào nhà sau thời khắc giao thừa gọi là **người xông đất**, được gia chủ lựa chọn kỹ càng để mang lại vượng khí cho cả năm.`,
    usefulPhrases: [
      {
        word: 'Chúc mừng năm mới',
        pronunciation: 'chúc-mừng-năm-mới',
        meaning: 'Happy New Year!',
        context: 'Lời chúc cửa miệng thân thuộc nhất dịp Tết.',
      },
      {
        word: 'An khang thịnh vượng',
        pronunciation: 'an-khang-thịnh-vượng',
        meaning: 'Peace, health, and prosperity',
        context: 'Lời chúc trang trọng dành tặng đối tác, gia đình.',
      },
      {
        word: 'Lì xì may mắn',
        pronunciation: 'lì-xì-may-mắn',
        meaning: 'Lucky red envelope money',
        context: 'Phong tục trao may mắn cho trẻ em và người già.',
      },
    ],
    relatedArticles: ['nghe-thuat-xung-ho-viet-nam', 'kham-pha-hoi-an'],
  },
  {
    id: 'kham-pha-hoi-an',
    title: 'Khám phá nét duyên phố cổ Hội An: Đèn lồng, ẩm thực và nếp sống mộc mạc',
    titleVi: 'Khám phá nét duyên phố cổ Hội An: Đèn lồng, ẩm thực và nếp sống mộc mạc',
    titleEn: 'Discover the Charm of Ancient Hoi An: Lanterns, Food & Timeless Heritage',
    subtitle: 'Thương cảng sầm uất thế kỷ 17 được bảo tồn gần như nguyên vẹn bên dòng sông Hoài êm đềm',
    subtitleVi: 'Thương cảng sầm uất thế kỷ 17 được bảo tồn gần như nguyên vẹn bên dòng sông Hoài êm đềm',
    subtitleEn: 'A 17th-century bustling international trading port preserved peacefully along the Hoai River',
    category: 'travel-spots',
    categoryName: 'Danh lam & Điểm đến',
    categoryNameVi: 'Danh lam & Điểm đến',
    categoryNameEn: 'Destinations & Sights',
    destination: 'hoian',
    destinationName: 'Hội An',
    destinationNameVi: 'Hội An',
    destinationNameEn: 'Hoi An',
    readTime: '5 phút đọc',
    readTimeVi: '5 phút đọc',
    readTimeEn: '5 min read',
    publishedDate: '25/03/2026',
    author: 'Hoàng Minh Châu',
    authorRole: 'Cây bút du lịch Heritage',
    authorRoleVi: 'Cây bút du lịch Heritage',
    authorRoleEn: 'Heritage Travel Writer',
    isFeatured: false,
    coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
    summary: 'Hội An mê hoặc du khách bởi những bức tường vàng rêu phong, giàn hoa giấy rực rỡ, cây Chùa Cầu trăm năm và lễ hội hoa đăng lung linh huyền ảo mỗi đêm rằm.',
    summaryVi: 'Hội An mê hoặc du khách bởi những bức tường vàng rêu phong, giàn hoa giấy rực rỡ, cây Chùa Cầu trăm năm và lễ hội hoa đăng lung linh huyền ảo mỗi đêm rằm.',
    summaryEn: 'Hoi An enchants visitors with moss-covered yellow walls, vibrant bougainvillea, the historic Japanese Covered Bridge, and floating candlelit lanterns on full-moon nights.',
    contentVi: `### 🏮 Lung linh đêm hoa đăng sông Hoài

Khi hoàng hôn buông xuống, toàn bộ khu phố cổ tắt bớt đèn điện hiện đại để nhường chỗ cho hàng vạn chiếc đèn lồng lụa rực rỡ sắc màu. Đi thuyền thả hoa đăng trên dòng sông Hoài là trải nghiệm lãng mạn và an yên bậc nhất miền Trung.

---

### 🍜 Ẩm thực Hội An: Cao lầu & Bánh mì nức tiếng

Đến Hội An, bạn nhất định phải thử **Cao lầu** – món mì đặc trưng mà tương truyền nước nhào bột phải lấy từ giếng nước cổ Bá Lễ, cùng tro củi cù lao Chàm; và **Bánh mì Phượng** hay **Bánh mì Madam Khánh** đã được nhiều đầu bếp quốc tế ca ngợi là bánh mì ngon nhất thế giới!`,
    contentEn: `### 🏮 Sparkling Lantern Nights on the Hoai River

At dusk, the ancient town dims modern electric lights to make way for thousands of radiant silk lanterns. Gliding along the river on a small wooden boat to release floating flower lanterns is an unforgettable experience.

---

### 🍜 Hoi An Cuisine: Cao Lau & Renowned Banh Mi

In Hoi An, savor **Cao Lau**—an iconic noodle bowl prepared with water drawn from the ancient Ba Le well; and world-acclaimed sandwiches from Banh Mi Phuong or Madam Khanh!`,
    content: `### 🏮 Lung linh đêm hoa đăng sông Hoài

Khi hoàng hôn buông xuống, toàn bộ khu phố cổ tắt bớt đèn điện hiện đại để nhường chỗ cho hàng vạn chiếc đèn lồng lụa rực rỡ sắc màu. Đi thuyền thả hoa đăng trên dòng sông Hoài là trải nghiệm lãng mạn và an yên bậc nhất miền Trung.

---

### 🍜 Ẩm thực Hội An: Cao lầu & Bánh mì nức tiếng

Đến Hội An, bạn nhất định phải thử **Cao lầu** – món mì đặc trưng mà tương truyền nước nhào bột phải lấy từ giếng nước cổ Bá Lễ, cùng tro củi cù lao Chàm; và **Bánh mì Phượng** hay **Bánh mì Madam Khánh** đã được nhiều đầu bếp quốc tế ca ngợi là bánh mì ngon nhất thế giới!`,
    usefulPhrases: [
      {
        word: 'Đèn lồng phố cổ',
        pronunciation: 'đèn-lồng-phố-cổ',
        meaning: 'Old town silk lanterns',
        context: 'Biểu tượng văn hóa đặc sắc của Hội An.',
      },
      {
        word: 'Thả hoa đăng',
        pronunciation: 'thả-hoa-đăng',
        meaning: 'Floating flower lanterns on the river to make wishes',
        context: 'Hoạt động trải nghiệm nổi tiếng trên sông Hoài.',
      },
      {
        word: 'Cao lầu Hội An',
        pronunciation: 'cao-lầu-hội-an',
        meaning: 'Hoi An signature noodle bowl with crispy pork and greens',
        context: 'Món ăn đặc sản nhất định phải thử khi đến Hội An.',
      },
    ],
    relatedArticles: ['van-hoa-ca-phe-viet-nam', 'cho-noi-mientay'],
  },
  {
    id: 'cho-noi-mientay',
    title: 'Nét đặc trưng văn hóa chợ nổi miền Tây sông nước Cái Răng',
    titleVi: 'Nét đặc trưng văn hóa chợ nổi miền Tây sông nước Cái Răng',
    titleEn: 'Vibrant Mekong Delta Floating Markets: River Life & Orchard Abundance',
    subtitle: 'Cây bẹo treo hàng hóa và nhịp sống độc đáo trên mênh mông sông rạch Đồng bằng sông Cửu Long',
    subtitleVi: 'Cây bẹo treo hàng hóa và nhịp sống độc đáo trên mênh mông sông rạch Đồng bằng sông Cửu Long',
    subtitleEn: 'Bamboo poles showcasing fresh produce and unique trading traditions along southern waterways',
    category: 'travel-spots',
    categoryName: 'Danh lam & Điểm đến',
    categoryNameVi: 'Danh lam & Điểm đến',
    categoryNameEn: 'Destinations & Sights',
    destination: 'mientay',
    destinationName: 'Miền Tây',
    destinationNameVi: 'Miền Tây',
    destinationNameEn: 'Mekong Delta',
    readTime: '5 phút đọc',
    readTimeVi: '5 phút đọc',
    readTimeEn: '5 min read',
    publishedDate: '27/03/2026',
    author: 'Út Trà Vinh',
    authorRole: 'Hướng dẫn viên bản địa',
    authorRoleVi: 'Hướng dẫn viên bản địa',
    authorRoleEn: 'Local Heritage Guide',
    isFeatured: false,
    coverImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    summary: 'Từ 4-5 giờ sáng, hàng trăm chiếc ghe thuyền chở đầy hoa trái miệt vườn tụ hội trên ngã ba sông, tạo nên bức tranh thương hồ sống động và hào sảng của con người phương Nam.',
    summaryVi: 'Từ 4-5 giờ sáng, hàng trăm chiếc ghe thuyền chở đầy hoa trái miệt vườn tụ hội trên ngã ba sông, tạo nên bức tranh thương hồ sống động và hào sảng của con người phương Nam.',
    summaryEn: 'From early morning, hundreds of boats laden with fresh tropical fruits gather at river intersections, painting a lively and hospitable portrait of Mekong Delta commerce.',
    contentVi: `### 🛶 Độc đáo "Cây bẹo" chào hàng không lời

Giữa mênh mông sóng nước ồn ào tiếng động cơ thuyền, người buôn bán không thể cất tiếng rao từng món. Vì thế họ sáng tạo ra **"Cây bẹo"** – một cây sào tre dài dựng đứng trước mũi ghe, trên treo quả dưa hấu thì bán dưa, treo chùm nhãn thì bán nhãn. Khách hàng từ xa nhìn thấy là biết ghe đó bán thứ gì!

---

### 🍜 Ăn tô hủ tiếu bồng bềnh trên sóng nước

Còn gì thi vị bằng việc neo ghe cạnh một chiếc thuyền bán đồ ăn sáng, gọi một tô **hủ tiếu Nam Vang** hay **bún riêu cua** bốc khói nghi ngút, kèm ly cà phê sữa đá mát lạnh giữa ngọn gió sông ban mai trong lành!`,
    contentEn: `### 🛶 The Clever "Cây Bẹo" Display Pole

Across expansive waters echoing with boat engines, merchants cannot shout their wares. Instead, they invented the **"Cây bẹo"**—a tall bamboo pole at the bow of the boat. Hanging a watermelon means selling watermelon; hanging longans signals longans for sale!

---

### 🍜 Enjoying Noodles Floating on the Waves

Nothing compares to mooring alongside a floating breakfast boat, ordering a steaming bowl of **Hu Tieu** or **Bun Rieu**, paired with an iced milk coffee in the crisp morning river breeze!`,
    content: `### 🛶 Độc đáo "Cây bẹo" chào hàng không lời

Giữa mênh mông sóng nước ồn ào tiếng động cơ thuyền, người buôn bán không thể cất tiếng rao từng món. Vì thế họ sáng tạo ra **"Cây bẹo"** – một cây sào tre dài dựng đứng trước mũi ghe, trên treo quả dưa hấu thì bán dưa, treo chùm nhãn thì bán nhãn. Khách hàng từ xa nhìn thấy là biết ghe đó bán thứ gì!

---

### 🍜 Ăn tô hủ tiếu bồng bềnh trên sóng nước

Còn gì thi vị bằng việc neo ghe cạnh một chiếc thuyền bán đồ ăn sáng, gọi một tô **hủ tiếu Nam Vang** hay **bún riêu cua** bốc khói nghi ngút, kèm ly cà phê sữa đá mát lạnh giữa ngọn gió sông ban mai trong lành!`,
    usefulPhrases: [
      {
        word: 'Cây bẹo',
        pronunciation: 'cây-bẹo',
        meaning: 'Bamboo pole used on boats to display merchandise for sale',
        context: 'Nét sáng tạo độc đáo của chợ nổi Nam Bộ.',
      },
      {
        word: 'Thương hồ',
        pronunciation: 'thương-hồ',
        meaning: 'River traders / boat merchants living on waters',
        context: 'Từ ngữ chỉ những người buôn bán lênh đênh trên sông.',
      },
      {
        word: 'Miệt vườn sông nước',
        pronunciation: 'miệt-vườn-sông-nước',
        meaning: 'Fruit orchard countryside along waterways',
        context: 'Cảnh quan đặc trưng của vùng đồng bằng sông Cửu Long.',
      },
    ],
    relatedArticles: ['kham-pha-hoi-an', 'van-hoa-ca-phe-viet-nam'],
  },
];

export const cultureService = {
  async getCategories() {
    try {
      const response = await axiosClient.get('/api/culture/categories');
      const data = response?.result ?? response;
      if (Array.isArray(data) && data.length > 0) {
        return [
          { id: 'all', label: 'Tất cả danh mục', labelVi: 'Tất cả danh mục', labelEn: 'All Categories' },
          ...data.map(c => ({
            id: c.slug || c.id,
            label: c.name,
            labelVi: c.nameVi || c.name,
            labelEn: c.nameEn || c.name,
            icon: c.icon,
          })),
        ];
      }
    } catch (e) {
      console.warn('Failed to fetch categories from API, using fallback:', e.message);
    }
    return CULTURE_CATEGORIES;
  },

  getCategoriesSync() {
    return CULTURE_CATEGORIES;
  },

  async getDestinations() {
    try {
      const response = await axiosClient.get('/api/culture/destinations');
      const data = response?.result ?? response;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Failed to fetch destinations from API, using fallback:', e.message);
    }
    return CULTURE_DESTINATIONS;
  },

  getDestinationsSync() {
    return CULTURE_DESTINATIONS;
  },

  async listArticlesFromApi({ search = '', category = 'all', destination = 'all', signal } = {}) {
    const params = {};
    if (search?.trim()) params.search = search.trim();
    if (category && category !== 'all') params.category = category;
    if (destination && destination !== 'all') params.destination = destination;

    const response = await axiosClient.get('/api/culture/articles', { params, signal });
    const data = response?.result ?? response;
    if (!Array.isArray(data)) throw new Error('Invalid culture article response.');
    return data;
  },

  async listArticles(filters = {}) {
    try {
      return await this.listArticlesFromApi(filters);
    } catch (e) {
      console.warn('Failed to fetch articles from API, using fallback:', e.message);
    }
    return this.listArticlesSync(filters);
  },

  listArticlesSync({ search = '', category = 'all', destination = 'all' } = {}) {
    let result = [...CULTURE_ARTICLES];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'all') {
      result = result.filter(a => a.category === category);
    }

    if (destination && destination !== 'all') {
      result = result.filter(a => a.destination === destination);
    }

    return result;
  },

  async getFeaturedArticles() {
    try {
      const response = await axiosClient.get('/api/culture/articles/featured');
      const data = response?.result ?? response;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Failed to fetch featured articles from API, using fallback:', e.message);
    }
    return CULTURE_ARTICLES.filter(a => a.isFeatured);
  },

  async getArticle(id) {
    if (!id) return null;
    try {
      const response = await axiosClient.get(`/api/culture/articles/${encodeURIComponent(id)}`);
      const data = response?.result ?? response;
      if (data && data.id) {
        return data;
      }
    } catch (e) {
      console.warn('Failed to fetch article from API, using fallback:', e.message);
    }
    return this.getArticleSync(id);
  },

  getArticleSync(id) {
    return CULTURE_ARTICLES.find(a => a.id === id) || null;
  },

  async getRelatedArticles(id) {
    if (!id) return [];
    try {
      const response = await axiosClient.get(`/api/culture/articles/${encodeURIComponent(id)}/related`);
      const data = response?.result ?? response;
      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.warn('Failed to fetch related articles from API, using fallback:', e.message);
    }
    return this.getRelatedArticlesSync(id);
  },

  getRelatedArticlesSync(id) {
    const article = this.getArticleSync(id);
    if (!article) return [];
    return CULTURE_ARTICLES.filter(
      a => a.id !== id && (article.relatedArticles?.includes(a.id) || a.destination === article.destination || a.category === article.category)
    ).slice(0, 3);
  },
};
