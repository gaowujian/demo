# 终于弄懂JS的计算精度问题

# 背景
### js存在计算精度不足问题
### js存在大数计算表示方式问题(小数也是)

    ```
    0.0000001 //1e-7
    ```

# 提醒

    精度缺失不是小于或者大于某个值就会出现精度缺失，而是落在固定间隔长度的数值中就会精度缺失

    精度缺失的原因是该数值在内存中不能完全记录下来

# 关于解决0.1 + 0.2 不等于 0.3的问题
    解决此问题通常做法是将小数乘以10^n使其成为整数,计算后再将结果除以10^n,n为他们之中最大的小数位(不是所有小数都适用，只有当值为字符串时，以十进制的逻辑进行计算，才能保证绝对正确)

## 解释原因

    想要解决这题，来回答个问题

### 如何取得小数点后面的位数?

    小数位的计算方式需要注意一下,当可以表示为n*e-7,或者更小的科学计数法时,toString会表现为科学计数法的表现形式,比如 0.0000001 会表示为 1e-7（而0.0000011由于可以写成1.1e-6,所以toString时还是为0.0000011）

```
    0.0000001 //1e-7
    (0.0000001).toString() //"1e-7"
    (new Number(0.0000001) + 1).toString() //"1.0000001",当+1处理时可以让其恢复正常,但是有时会失效，失效原因小文会提

    0.000000000000001 //1e-15
    (new Number(0.000000000000001) + 1).toString() //"1.000000000000001"

    0.0000000000000001 //1e-16
    (new Number(0.0000000000000001) + 1).toString() //"1"

    1.000000000000001 //1.000000000000001
    1.0000000000000001 //1

    1.000000000000001 * 10000000000000000 //10000000000000012
    1.000000000000001 * 1000000000000000 //1000000000000001.1
```


    为什么会这样，因为在你输入1.0000000000000001时，存到内存中精度就已经缺失了，等看完下文，js中数字在内存的存储方式就知道了（IEEE-754双精度数字）

### 只能从字符串的方向入手
    从输入端来说
    无办法将1.0000000000000001 转化为 "1.0000000000000001" (就算用decimal.js、bignumber.js也同样的道理，输入的值一开始就精度缺失了，用什么方法也挽回不了的)
    所以需要的大数计算只能一开始输入就为字符串

    结论是精度丢失只能在一定程度上避免,如果不用字符串作为输入的话,无法完美解决问题，题外话，BigInt类型也是，构建时参数输入字符串比较准确
```
BigInt(9999999999999999)   //10000000000000000n
BigInt("9999999999999999") //9999999999999999n
```

# 核心知识点（js的Number在内存中怎么存储的）

    js中,number用64位双精度表示:,1位符号位 11位表示指数位 52位表示数值位 
    表示方式为 
    
|  符号位   | 指数位  | 数值位 |
|  ----  | ----  |  ----  |
| +/-  | y...y(y有11个) | 1.xxx...xx(x有52个) |

   

    ## 规定：指数位全为1或0时有特殊作用（(所以上面，y的范围为(-2^10 + 1) ~ (2^10 - 1),再去掉0和1023,-1023)）

    ### 指数位全为1时
    指数位全为1,数值位不为0时:NaN

    当指数位全位1，数值位为0时，表示无穷(符号位为0，代表 + Infinity,符号位为1，代表 - Infinity)

    ### 指数位全为0时
    在数值位前面有一个隐藏头（1.），这使得我们没有办法表示 0 这个真值，所以IEEE754遵循了传统的二进制编码全0方式来代表0,所以:
    指数位全为0,数值位也为0时:0

    指数位全为0,数值位不为0时:为了不浪费数值位,将其表示为2^-1022 * 数组部分(0.开头,二进制形式),所以IEEE 754双精度(64位)能表示的最小数位2^-1022 * 2^-52 == 2^-1074(二进制) == 5e-324(十进制)

    js能表示的纯整数数值范围是 -1.7976931348623157e+308 ~ 1.7976931348623157e+308
    js能表示的纯小数数值范围是 （-1< ~ -(5e-324)）和（5e-324 ~ <1）

# 为什么1.0000000000000001 === 1
## 1.xxxx不为1的极限(最小值)在哪？
```
//为什么1.0000000000000001 === 1？
// 1.xxxx不为1的极限(最小值)在哪？

// 从IEEE-754双精度的设计角度来计算
//模拟数值位，52位+默认前面的（1.）,所以共53位，所以模拟的时候也得53位
let ecode = '';
ecode+=1;
for(var i=0;i<51;i++){
    ecode+=0;
}
ecode+=1;

console.log(ecode);                             //10000000000000000000000000000000000000000000000000001
let result = parseInt(ecode,2)*Math.pow(2,-52); 
console.log(result); //1.0000000000000002
console.log(Math.pow(2,-52));  //2.220446049250313e-16

/*
所以真实的值里
10000000000000000000000000000000000000000000000000001(b)
其实是1 + 2.220446049250313e-16
所以1.0000000000000002的答案也是精度缺失造成的
所以不要误认为你在控制台打印1.0000000000000002时输出1.0000000000000002是因为它不存在精度缺失
而是在你把它放进内存时就已经缺失了精度，只是你打印出来时通过取舍后恰好表现一致罢了
*/
```

# 结论
从最小位数可知，能表示的最小的单位为
```
Math.pow(2,-52)*Math.pow(2,-1022); //5e-324
/***
Math.pow(2,-52)表示数值位为000...001,Math.pow(2,-1022)表示指数位为111...110,此时表示最小能表示的正数；第二小的正数为1e-323（5e-324 * 2 == 1e-323），所以0 ~ 5e-324,5e-324 ~ 1e-323，....(以此类推)，这中间的数值就是表示不了的数值，所以精度会缺失的数值也是落在这些 最小单位为5e-324 的区间上

5e-324注意是number小于1时才有的最小单位（因为只有指数位都为0时，数值位才默认是0.开头）

当number大于1时，最小单位为2.220446049250313e-16,也就是Number.EPSILON
Math.pow(2,-52) == 2.220446049250313e-16

1 + 2.220446049250313e-16 * 2 //1.0000000000000004
1 + 2.220446049250313e-16 * 3 //1.0000000000000007
1 + 2.220446049250313e-16 * 4 //1.0000000000000009
***/
```

# 其他可看可不看的知识点
Number.MAX_SAFE_INTEGER

```
Number.MAX_SAFE_INTEGER //9007199254740991 ,也就是2^53 - 1
```

Number.isSafeInteger

    Number.isSafeInteger 判断是否是js的安全整数 (-2^53 + 1 ~ 2^53 - 1)

    一个安全整数是一个符合下面条件的整数：

    可以准确地表示为一个IEEE-754双精度数字,
    其IEEE-754表示不能是舍入任何其他整数以适应IEEE-754表示的结果。

# 参考库
[decimal.js](https://github.com/MikeMcl/decimal.js)

[bignumber.js](https://github.com/MikeMcl/bignumber.js/)

# 参考资料
[核心知识点看不懂时可以再看下：JS基础回顾-数值-IEEE754](https://www.jianshu.com/p/b665f5e08f3a?utm_campaign=hugo)

[JS最新基本数据类型:BigInt](https://segmentfault.com/a/1190000019912017?utm_source=tag-newest)
