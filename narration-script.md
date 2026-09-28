# Narration script

Record each line below and save it as `assets/audio/narration/<id>.m4a`.
Then set `"recorded": true` for that line in `src/data/narration.json`.
Regenerate this file with `node tools/make-narration-script.mjs`.

Tips: quiet room, phone about a hand's width from your mouth, a short pause
before and after each line, one line per file. Upbeat and slow, as if talking
to a 6-year-old. The iPhone Voice Memos app records .m4a.

| File name (id) | Say this | Status |
|---|---|---|
| `boot.welcome` | Hi! Let's play with chemistry! | done |
| `menu.soon` | That one is coming soon! | TO RECORD |
| `state.solid` | Solid! A solid keeps its own shape. | TO RECORD |
| `state.liquid` | Liquid! A liquid pours, and takes the shape of its cup. | TO RECORD |
| `state.gas` | Gas! A gas spreads out to fill up all the space it has. | TO RECORD |
| `intro.solid.try` | This block is a solid. Move it into the bowl! | done |
| `intro.solid` | Look! The block is still a block. A solid keeps its own shape. | TO RECORD |
| `intro.liquid.try` | This juice is a liquid. Pour it into the bowl! | TO RECORD |
| `intro.liquid` | Look! The juice spread out to fill the bottom of the bowl. A liquid takes the shape of its cup. | TO RECORD |
| `intro.gas.try` | This jar is full of gas. We can't see most gases, so dots show where it is. Tap the jar! | TO RECORD |
| `intro.gas` | Look! The gas spread out to fill the whole box. A gas fills all the space it has. | TO RECORD |
| `intro.done` | Now you know solids, liquids, and gases. Let's sort! | TO RECORD |
| `sorter.intro` | Is it a solid, a liquid, or a gas? Drag it into the right box! | TO RECORD |
| `sorter.tryAgain` | Hmm, try again! | TO RECORD |
| `sorter.hint` | Try this box! | TO RECORD |
| `sorter.done` | You did it! You sorted them all! | TO RECORD |
| `sorter.pickLevel` | Which game? Sorting, or heating and cooling? | TO RECORD |
| `level2.unlocked` | Wow! You found a new game: heating and cooling! | TO RECORD |
| `level2.intro` | Heating and cooling can change things! Sort it, then change it, and sort it again! | TO RECORD |
| `level2.heat` | Now tap the fire to heat it up! | TO RECORD |
| `level2.cool` | Now tap the snowflake to cool it down! | TO RECORD |
| `change.ice.water` | The ice got warm and melted into water! Where does water go? | TO RECORD |
| `change.water.steam` | The water got so hot it boiled into steam! Where does steam go? | TO RECORD |
| `change.steam.water` | The steam cooled down and turned back into water! Where does it go now? | TO RECORD |
| `change.water.ice` | The water got so cold it froze into ice! Where does ice go? | TO RECORD |
| `change.chocolate.meltedChocolate` | The chocolate got warm and melted! Where does melted chocolate go? | TO RECORD |
| `change.meltedChocolate.chocolate` | The chocolate cooled down and got hard again! Where does it go now? | TO RECORD |
| `change.butter.meltedButter` | The butter got warm and melted! Where does melted butter go? | TO RECORD |
| `lab.intro` | Welcome to the kitchen lab! Let's try something. Put the ice cube on the hot plate! | TO RECORD |
| `lab.free` | You made a discovery, and you got a sticker! There are lots more to find. Try anything you like! | TO RECORD |
| `lab.stickers` | Your discovery stickers! Can you find them all? | TO RECORD |
| `lab.nothing` | Hmm, nothing new happened. Try something else! | TO RECORD |
| `lab.notInBeaker` | Let's try that on the hot plate, or in the freezer! | TO RECORD |
| `lab.stir` | Now stir it with the spoon! | TO RECORD |
| `lab.stirred` | Stir, stir, stir! | TO RECORD |
| `lab.freshWater` | Fresh, clean water! | TO RECORD |
| `lab.hotPlate` | The hot plate. It heats things up! | TO RECORD |
| `lab.freezer` | The freezer. It cools things down! | TO RECORD |
| `lab.beaker` | A beaker full of water. Try putting things in it! | TO RECORD |
| `lab.spoon` | A spoon, for stirring the water! | TO RECORD |
| `lab.magnifier` | A magnifying glass! Hold it over the water to look up close. | TO RECORD |
| `lab.magnify.water` | Up close, water is made of tiny bits too, and they're always moving! | TO RECORD |
| `lab.magnify.dissolved` | Look! Tiny bits are spread all through the water. It's still there, even though you can't see it! | TO RECORD |
| `lab.magnify.grains` | Those pieces haven't dissolved yet. Stir them! | TO RECORD |
| `lab.magnify.sand` | The sand grains just sit at the bottom. They don't mix into the water. | TO RECORD |
| `lab.magnify.oil` | The oil stays in its own layer, on top of the water. | TO RECORD |
| `disc.meltIce` | The ice melted into water! Heat turns solid ice into liquid water. | TO RECORD |
| `disc.freezeWater` | The water froze into ice! Cold turns liquid water into solid ice. | TO RECORD |
| `disc.boilWater` | The water got so hot it boiled into steam! Steam is water as a gas, and it floats away. | TO RECORD |
| `disc.meltChocolate` | The chocolate melted! Warm chocolate turns into a liquid. | TO RECORD |
| `disc.hardenChocolate` | The melted chocolate cooled down and got hard again! Melting can be undone. | TO RECORD |
| `disc.meltButter` | The butter melted into a liquid! | TO RECORD |
| `disc.hardenButter` | The melted butter cooled down and turned solid again! | TO RECORD |
| `disc.toast` | The bread turned into toast! The heat changed it into something new. | TO RECORD |
| `disc.toastStays` | The toast is still toast! Cooling it can't turn it back into bread. Some changes can't be undone. | TO RECORD |
| `disc.iceFloats` | The ice floats! Ice is lighter than the same amount of water. | TO RECORD |
| `disc.sugarDissolves` | The sugar dissolved! You can't see it anymore, but it's still in the water. Look with the magnifying glass! | TO RECORD |
| `disc.saltDissolves` | The salt dissolved! You can't see it anymore, but it's still in the water. Look with the magnifying glass! | TO RECORD |
| `disc.sandSinks` | The sand didn't dissolve. It sank back down to the bottom! | TO RECORD |
| `disc.oilFloats` | The oil floats on top of the water. Oil and water don't mix! | TO RECORD |
| `disc.fizz` | Fizz! The baking soda and vinegar made something new: bubbles of a gas called carbon dioxide! | TO RECORD |
| `item.sugar.name` | Sugar! | TO RECORD |
| `item.salt.name` | Salt! | TO RECORD |
| `item.sand.name` | Sand! | TO RECORD |
| `item.oil.name` | Cooking oil! | TO RECORD |
| `item.bakingSoda.name` | Baking soda! | TO RECORD |
| `item.vinegar.name` | Vinegar! | TO RECORD |
| `item.bread.name` | A slice of bread! | TO RECORD |
| `item.toast.name` | Toast! | TO RECORD |
| `item.ice.name` | An ice cube! | TO RECORD |
| `item.ice.fact` | Ice is a solid. It keeps its shape! | TO RECORD |
| `item.rock.name` | A rock! | TO RECORD |
| `item.rock.fact` | A rock is a solid. It's hard, and it keeps its shape. | TO RECORD |
| `item.spoon.name` | A spoon! | TO RECORD |
| `item.spoon.fact` | A spoon is a solid. Put it anywhere, and it stays spoon-shaped. | TO RECORD |
| `item.brick.name` | A brick! | TO RECORD |
| `item.brick.fact` | A brick is a solid. It's hard and strong! | TO RECORD |
| `item.teddy.name` | A teddy bear! | TO RECORD |
| `item.teddy.fact` | A teddy bear is a solid. Squish it, let go, and it's still teddy-shaped! | TO RECORD |
| `item.crayon.name` | A crayon! | TO RECORD |
| `item.crayon.fact` | A crayon is a solid. It has its own shape. | TO RECORD |
| `item.water.name` | Water! | TO RECORD |
| `item.water.fact` | Water is a liquid. It pours, and takes the shape of its cup! | TO RECORD |
| `item.milk.name` | Milk! | TO RECORD |
| `item.milk.fact` | Milk is a liquid. You can pour it! | TO RECORD |
| `item.juice.name` | Juice! | TO RECORD |
| `item.juice.fact` | Juice is a liquid. It flows and splashes! | TO RECORD |
| `item.honey.name` | Honey! | TO RECORD |
| `item.honey.fact` | Honey is a liquid too. It's thick and slow, but it still pours! | TO RECORD |
| `item.chocolate.name` | A chocolate bar! | TO RECORD |
| `item.chocolate.fact` | Chocolate is a solid. It keeps its shape, until it gets warm! | TO RECORD |
| `item.meltedChocolate.name` | Melted chocolate! | TO RECORD |
| `item.meltedChocolate.fact` | Melted chocolate is a liquid. It pours! | TO RECORD |
| `item.butter.name` | A block of butter! | TO RECORD |
| `item.butter.fact` | Cold butter is a solid. It keeps its shape. | TO RECORD |
| `item.meltedButter.name` | Melted butter! | TO RECORD |
| `item.meltedButter.fact` | Melted butter is a liquid. It pours! | TO RECORD |
| `item.balloon.name` | Air in a balloon! | TO RECORD |
| `item.balloon.fact` | Air is a gas. It spreads out to fill the whole balloon! | TO RECORD |
| `item.steam.name` | Steam from a teapot! | TO RECORD |
| `item.steam.fact` | Steam is water that turned into a gas. It floats up and spreads out! | TO RECORD |
| `item.puff.name` | A puff of air! | TO RECORD |
| `item.puff.fact` | When you blow, you push out air. Air is a gas! | TO RECORD |
