
/* ===== 영어 자주 쓰는 단어 (단어|뜻|레벨|분류) ===== */
const VE_RAW=`
customer|손님, 고객|기초|사람
staff|직원(들)|기초|사람
manager|관리자, 점장|기초|사람
coworker|동료|기초|사람
friend|친구|기초|사람
family|가족|기초|사람
neighbor|이웃|기초|사람
store|가게|기초|장소
office|사무실|기초|장소
station|역|기초|장소
entrance|입구|기초|장소
exit|출구|기초|장소
counter|계산대, 카운터|기초|장소
warehouse|창고|기초|장소
downtown|시내|기초|장소
nearby|근처에|기초|장소
work|일하다; 일|기초|일상
job|직업, 일|기초|일상
shift|근무 교대(시간)|기초|일상
schedule|일정|기초|일상
break|휴식 시간|기초|일상
day off|쉬는 날|기초|일상
weekend|주말|기초|일상
commute|통근하다|기초|일상
weather|날씨|기초|일상
umbrella|우산|기초|일상
money|돈|기초|일상
price|가격|기초|일상
cheap|싼|기초|형용사
expensive|비싼|기초|형용사
busy|바쁜|기초|형용사
free|한가한; 무료의|기초|형용사
easy|쉬운|기초|형용사
difficult|어려운|기초|형용사
heavy|무거운|기초|형용사
light|가벼운; 빛|기초|형용사
new|새로운|기초|형용사
old|오래된, 나이 든|기초|형용사
popular|인기 있는|기초|형용사
useful|유용한|기초|형용사
quiet|조용한|기초|형용사
noisy|시끄러운|기초|형용사
tired|피곤한|기초|형용사
hungry|배고픈|기초|형용사
sure|확실한|기초|형용사
ready|준비된|기초|형용사
buy|사다|기초|동사
sell|팔다|기초|동사
pay|지불하다|기초|동사
spend|(돈·시간을) 쓰다|기초|동사
save|저축하다; 아끼다|기초|동사
need|필요하다|기초|동사
want|원하다|기초|동사
try|시도하다, 써 보다|기초|동사
use|사용하다|기초|동사
help|돕다|기초|동사
ask|묻다, 부탁하다|기초|동사
answer|대답하다|기초|동사
explain|설명하다|기초|동사
show|보여 주다|기초|동사
find|찾다|기초|동사
look for|~을 찾다|기초|동사
wait|기다리다|기초|동사
bring|가져오다|기초|동사
carry|들고 다니다, 나르다|기초|동사
open|열다|기초|동사
close|닫다|기초|동사
start|시작하다|기초|동사
finish|끝내다|기초|동사
forget|잊다|기초|동사
remember|기억하다|기초|동사
choose|고르다|기초|동사
compare|비교하다|기초|동사
change|바꾸다; 거스름돈|기초|동사
check|확인하다|기초|동사
call|전화하다; 부르다|기초|동사
always|항상|기초|부사
usually|보통|기초|부사
often|자주|기초|부사
sometimes|가끔|기초|부사
never|절대 ~않다|기초|부사
already|이미|기초|부사
still|아직, 여전히|기초|부사
soon|곧|기초|부사
almost|거의|기초|부사
together|함께|기초|부사
available|이용 가능한; 시간이 되는|토익|형용사
responsible|책임 있는, 담당하는|토익|형용사
convenient|편리한|토익|형용사
reliable|믿을 수 있는|토익|형용사
efficient|효율적인|토익|형용사
affordable|가격이 적당한|토익|형용사
durable|내구성 있는|토익|형용사
eligible|자격이 있는|토익|형용사
mandatory|의무적인|토익|형용사
temporary|임시의|토익|형용사
permanent|영구적인, 정규의|토익|형용사
previous|이전의|토익|형용사
upcoming|다가오는|토익|형용사
annual|연례의, 매년의|토익|형용사
recent|최근의|토익|형용사
current|현재의|토익|형용사
additional|추가의|토익|형용사
sufficient|충분한|토익|형용사
appropriate|적절한|토익|형용사
considerable|상당한|토익|형용사
extensive|광범위한|토익|형용사
outstanding|뛰어난; 미지불의|토익|형용사
confidential|기밀의|토익|형용사
complimentary|무료의|토익|형용사
defective|결함 있는|토익|형용사
approximately|대략|토익|부사
immediately|즉시|토익|부사
promptly|신속하게; 정각에|토익|부사
recently|최근에|토익|부사
currently|현재|토익|부사
previously|이전에|토익|부사
frequently|빈번하게|토익|부사
regularly|정기적으로|토익|부사
temporarily|일시적으로|토익|부사
unfortunately|유감스럽게도|토익|부사
accordingly|그에 따라|토익|부사
nearly|거의 (~할 뻔한)|토익|부사
exactly|정확히|토익|부사
apply|지원하다; 적용하다|토익|동사
submit|제출하다|토익|동사
attend|참석하다|토익|동사
announce|발표하다|토익|동사
arrange|준비하다, 정리하다|토익|동사
confirm|(예약·일정을) 확정하다, 확인해 주다|토익|동사
cancel|취소하다|토익|동사
postpone|연기하다|토익|동사
extend|연장하다|토익|동사
expand|확장하다|토익|동사
increase|증가하다|토익|동사
decrease|감소하다|토익|동사
improve|개선하다|토익|동사
require|요구하다|토익|동사
provide|제공하다|토익|동사
offer|제공하다; 제안|토익|동사
include|포함하다|토익|동사
exchange|교환하다|토익|동사
refund|환불하다; 환불|토익|동사
replace|교체하다|토익|동사
repair|수리하다|토익|동사
deliver|배달하다|토익|동사
ship|배송하다|토익|동사
order|주문하다; 주문|토익|동사
purchase|구매하다; 구매|토익|동사
reserve|예약하다|토익|동사
recommend|추천하다|토익|동사
inform|알리다|토익|동사
notify|통지하다|토익|동사
remind|상기시키다|토익|동사
review|검토하다; 후기|토익|동사
approve|승인하다|토익|동사
assign|배정하다|토익|동사
hire|고용하다|토익|동사
train|교육하다|토익|동사
handle|처리하다, 다루다|토익|동사
manage|관리하다|토익|동사
organize|조직하다, 정리하다|토익|동사
inspect|점검하다|토익|동사
maintain|유지하다|토익|동사
launch|출시하다; 출시|토익|동사
promote|홍보하다; 승진시키다|토익|동사
attract|끌어들이다|토익|동사
estimate|추정하다; 견적|토익|동사
afford|여유가 되다|토익|동사
appreciate|감사하다|토익|동사
inquiry|문의|토익|명사
request|요청|토익|명사
receipt|영수증|토익|명사
invoice|청구서|토익|명사
warranty|보증|토익|명사
discount|할인|토익|명사
inventory|재고|토익|명사
shipment|배송(품)|토익|명사
delivery|배달|토익|명사
merchandise|상품|토익|명사
item|물품, 항목|토익|명사
branch|지점|토익|명사
headquarters|본사|토익|명사
department|부서|토익|명사
employee|직원|토익|명사
employer|고용주|토익|명사
supervisor|감독자, 상사|토익|명사
applicant|지원자|토익|명사
position|직책, 자리|토익|명사
promotion|승진; 판촉|토익|명사
salary|급여|토익|명사
deadline|마감일|토익|명사
budget|예산|토익|명사
revenue|수익|토익|명사
profit|이익|토익|명사
expense|비용|토익|명사
figure|수치|토익|명사
survey|설문 조사|토익|명사
feedback|의견|토익|명사
complaint|불만|토익|명사
policy|정책, 방침|토익|명사
procedure|절차|토익|명사
regulation|규정|토익|명사
agreement|합의, 계약|토익|명사
contract|계약(서)|토익|명사
facility|시설|토익|명사
equipment|장비|토익|명사
device|기기|토익|명사
feature|기능, 특징|토익|명사
quality|품질|토익|명사
performance|성능; 실적|토익|명사
capacity|용량, 수용력|토익|명사
demand|수요|토익|명사
supply|공급|토익|명사
competitor|경쟁사|토익|명사
advertisement|광고|토익|명사
brochure|안내 책자|토익|명사
Welcome!|어서 오세요!|접객|인사
How can I help you?|무엇을 도와드릴까요?|접객|인사
Are you looking for anything?|찾으시는 거 있으세요?|접객|인사
Take your time.|천천히 보세요.|접객|인사
Just a moment, please.|잠시만 기다려 주세요.|접객|인사
Sorry to keep you waiting.|기다리게 해서 죄송합니다.|접객|인사
Let me check.|확인해 볼게요.|접객|인사
It's sold out.|품절이에요.|접객|인사
We're out of stock.|재고가 없어요.|접객|인사
Would you like to try it?|한번 써 보시겠어요?|접객|인사
Here you are.|여기 있습니다.|접객|인사
Have a nice day!|좋은 하루 보내세요!|접객|인사
in stock|재고 있는|접객|매장
on sale|할인 중인|접객|매장
best seller|가장 잘 팔리는 상품|접객|매장
latest model|최신 모델|접객|매장
display model|전시 상품|접객|매장
battery life|배터리 사용 시간|접객|가전
charge|충전하다; 요금|접객|가전
charger|충전기|접객|가전
cable|케이블|접객|가전
screen|화면|접객|가전
setting|설정|접객|가전
noise|소음|접객|가전
suction|흡입력|접객|가전
air purifier|공기청정기|접객|가전
humidifier|가습기|접객|가전
robot vacuum|로봇청소기|접객|가전
cash|현금|접객|매장
credit card|신용카드|접객|매장
installment|할부|접객|매장
tax-free|면세의|접객|매장
bag|봉투|접객|매장
gift wrapping|선물 포장|접객|매장
`;
const VOCAB_EN=VE_RAW.trim().split("\n").map(l=>{ const [w,m,lv,c]=l.split("|"); return {id:"ve:"+w,w,r:"",m,lv,c}; });
