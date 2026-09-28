# Narration script

**2 of 103 lines recorded.** Lines marked "computer voice for now"
play a stand-in voice until you record them.

How to add a recording (details in README.md):
1. Record the line (iPhone Voice Memos is fine) and save it into `recordings-raw/`.
2. Run `node tools/prepare-narration.mjs "recordings-raw/<file>.m4a" <id>`.
3. Regenerate this file with `node tools/make-narration-script.mjs`.

Tips: quiet room, phone about a hand's width from your mouth, a short pause
before and after each line, one line per file. Upbeat and slow, as if talking
to a 6-year-old.

| File name (id) | Say this | Status |
|---|---|---|
| `boot.welcome` | Hi! Let's play with chemistry! | done |
| `menu.soon` | That one is coming soon! | TO RECORD (computer voice for now) |
| `state.solid` | Solid! A solid keeps its own shape. | TO RECORD (computer voice for now) |
| `state.liquid` | Liquid! A liquid pours, and takes the shape of its cup. | TO RECORD (computer voice for now) |
| `state.gas` | Gas! A gas spreads out to fill up all the space it has. | TO RECORD (computer voice for now) |
| `intro.solid.try` | This block is a solid. Move it into the bowl! | done |
| `intro.solid` | Look! The block is still a block. A solid keeps its own shape. | TO RECORD (computer voice for now) |
| `intro.liquid.try` | This juice is a liquid. Pour it into the bowl! | TO RECORD (computer voice for now) |
| `intro.liquid` | Look! The juice spread out to fill the bottom of the bowl. A liquid takes the shape of its cup. | TO RECORD (computer voice for now) |
| `intro.gas.try` | This jar is full of gas. We can't see most gases, so dots show where it is. Tap the jar! | TO RECORD (computer voice for now) |
| `intro.gas` | Look! The gas spread out to fill the whole box. A gas fills all the space it has. | TO RECORD (computer voice for now) |
| `intro.done` | Now you know solids, liquids, and gases. Let's sort! | TO RECORD (computer voice for now) |
| `sorter.intro` | Is it a solid, a liquid, or a gas? Drag it into the right box! | TO RECORD (computer voice for now) |
| `sorter.tryAgain` | Hmm, try again! | TO RECORD (computer voice for now) |
| `sorter.hint` | Try this box! | TO RECORD (computer voice for now) |
| `sorter.done` | You did it! You sorted them all! | TO RECORD (computer voice for now) |
| `sorter.pickLevel` | Which game? Sorting, or heating and cooling? | TO RECORD (computer voice for now) |
| `level2.unlocked` | Wow! You found a new game: heating and cooling! | TO RECORD (computer voice for now) |
| `level2.intro` | Heating and cooling can change things! Sort it, then change it, and sort it again! | TO RECORD (computer voice for now) |
| `level2.heat` | Now tap the fire to heat it up! | TO RECORD (computer voice for now) |
| `level2.cool` | Now tap the snowflake to cool it down! | TO RECORD (computer voice for now) |
| `change.ice.water` | The ice got warm and melted into water! Where does water go? | TO RECORD (computer voice for now) |
| `change.water.steam` | The water got so hot it boiled into steam! Where does steam go? | TO RECORD (computer voice for now) |
| `change.steam.water` | The steam cooled down and turned back into water! Where does it go now? | TO RECORD (computer voice for now) |
| `change.water.ice` | The water got so cold it froze into ice! Where does ice go? | TO RECORD (computer voice for now) |
| `change.chocolate.meltedChocolate` | The chocolate got warm and melted! Where does melted chocolate go? | TO RECORD (computer voice for now) |
| `change.meltedChocolate.chocolate` | The chocolate cooled down and got hard again! Where does it go now? | TO RECORD (computer voice for now) |
| `change.butter.meltedButter` | The butter got warm and melted! Where does melted butter go? | TO RECORD (computer voice for now) |
| `lab.intro` | Welcome to the kitchen lab! Let's try something. Put the ice cube on the hot plate! | TO RECORD (computer voice for now) |
| `lab.free` | You made a discovery, and you got a sticker! There are lots more to find. Try anything you like! | TO RECORD (computer voice for now) |
| `lab.stickers` | Your discovery stickers! Can you find them all? | TO RECORD (computer voice for now) |
| `lab.nothing` | Hmm, nothing new happened. Try something else! | TO RECORD (computer voice for now) |
| `lab.notInBeaker` | Let's try that on the hot plate, or in the freezer! | TO RECORD (computer voice for now) |
| `lab.stir` | Now stir it with the spoon! | TO RECORD (computer voice for now) |
| `lab.stirred` | Stir, stir, stir! | TO RECORD (computer voice for now) |
| `lab.freshWater` | Fresh, clean water! | TO RECORD (computer voice for now) |
| `lab.hotPlate` | The hot plate. It heats things up! | TO RECORD (computer voice for now) |
| `lab.freezer` | The freezer. It cools things down! | TO RECORD (computer voice for now) |
| `lab.beaker` | A beaker full of water. Try putting things in it! | TO RECORD (computer voice for now) |
| `lab.spoon` | A spoon, for stirring the water! | TO RECORD (computer voice for now) |
| `lab.magnifier` | A magnifying glass! Hold it over the water to look up close. | TO RECORD (computer voice for now) |
| `lab.magnify.water` | Up close, water is made of tiny bits too, and they're always moving! | TO RECORD (computer voice for now) |
| `lab.magnify.dissolved` | Look! Tiny bits are spread all through the water. It's still there, even though you can't see it! | TO RECORD (computer voice for now) |
| `lab.magnify.grains` | Those pieces haven't dissolved yet. Stir them! | TO RECORD (computer voice for now) |
| `lab.magnify.sand` | The sand grains just sit at the bottom. They don't mix into the water. | TO RECORD (computer voice for now) |
| `lab.magnify.oil` | The oil stays in its own layer, on top of the water. | TO RECORD (computer voice for now) |
| `disc.meltIce` | The ice melted into water! Heat turns solid ice into liquid water. | TO RECORD (computer voice for now) |
| `disc.freezeWater` | The water froze into ice! Cold turns liquid water into solid ice. | TO RECORD (computer voice for now) |
| `disc.boilWater` | The water got so hot it boiled into steam! Steam is water as a gas, and it floats away. | TO RECORD (computer voice for now) |
| `disc.meltChocolate` | The chocolate melted! Warm chocolate turns into a liquid. | TO RECORD (computer voice for now) |
| `disc.hardenChocolate` | The melted chocolate cooled down and got hard again! Melting can be undone. | TO RECORD (computer voice for now) |
| `disc.meltButter` | The butter melted into a liquid! | TO RECORD (computer voice for now) |
| `disc.hardenButter` | The melted butter cooled down and turned solid again! | TO RECORD (computer voice for now) |
| `disc.toast` | The bread turned into toast! The heat changed it into something new. | TO RECORD (computer voice for now) |
| `disc.toastStays` | The toast is still toast! Cooling it can't turn it back into bread. Some changes can't be undone. | TO RECORD (computer voice for now) |
| `disc.iceFloats` | The ice floats! Ice is lighter than the same amount of water. | TO RECORD (computer voice for now) |
| `disc.sugarDissolves` | The sugar dissolved! You can't see it anymore, but it's still in the water. Look with the magnifying glass! | TO RECORD (computer voice for now) |
| `disc.saltDissolves` | The salt dissolved! You can't see it anymore, but it's still in the water. Look with the magnifying glass! | TO RECORD (computer voice for now) |
| `disc.sandSinks` | The sand didn't dissolve. It sank back down to the bottom! | TO RECORD (computer voice for now) |
| `disc.oilFloats` | The oil floats on top of the water. Oil and water don't mix! | TO RECORD (computer voice for now) |
| `disc.fizz` | Fizz! The baking soda and vinegar made something new: bubbles of a gas called carbon dioxide! | TO RECORD (computer voice for now) |
| `item.sugar.name` | Sugar! | TO RECORD (computer voice for now) |
| `item.salt.name` | Salt! | TO RECORD (computer voice for now) |
| `item.sand.name` | Sand! | TO RECORD (computer voice for now) |
| `item.oil.name` | Cooking oil! | TO RECORD (computer voice for now) |
| `item.bakingSoda.name` | Baking soda! | TO RECORD (computer voice for now) |
| `item.vinegar.name` | Vinegar! | TO RECORD (computer voice for now) |
| `item.bread.name` | A slice of bread! | TO RECORD (computer voice for now) |
| `item.toast.name` | Toast! | TO RECORD (computer voice for now) |
| `item.ice.name` | An ice cube! | TO RECORD (computer voice for now) |
| `item.ice.fact` | Ice is a solid. It keeps its shape! | TO RECORD (computer voice for now) |
| `item.rock.name` | A rock! | TO RECORD (computer voice for now) |
| `item.rock.fact` | A rock is a solid. It's hard, and it keeps its shape. | TO RECORD (computer voice for now) |
| `item.spoon.name` | A spoon! | TO RECORD (computer voice for now) |
| `item.spoon.fact` | A spoon is a solid. Put it anywhere, and it stays spoon-shaped. | TO RECORD (computer voice for now) |
| `item.brick.name` | A brick! | TO RECORD (computer voice for now) |
| `item.brick.fact` | A brick is a solid. It's hard and strong! | TO RECORD (computer voice for now) |
| `item.teddy.name` | A teddy bear! | TO RECORD (computer voice for now) |
| `item.teddy.fact` | A teddy bear is a solid. Squish it, let go, and it's still teddy-shaped! | TO RECORD (computer voice for now) |
| `item.crayon.name` | A crayon! | TO RECORD (computer voice for now) |
| `item.crayon.fact` | A crayon is a solid. It has its own shape. | TO RECORD (computer voice for now) |
| `item.water.name` | Water! | TO RECORD (computer voice for now) |
| `item.water.fact` | Water is a liquid. It pours, and takes the shape of its cup! | TO RECORD (computer voice for now) |
| `item.milk.name` | Milk! | TO RECORD (computer voice for now) |
| `item.milk.fact` | Milk is a liquid. You can pour it! | TO RECORD (computer voice for now) |
| `item.juice.name` | Juice! | TO RECORD (computer voice for now) |
| `item.juice.fact` | Juice is a liquid. It flows and splashes! | TO RECORD (computer voice for now) |
| `item.honey.name` | Honey! | TO RECORD (computer voice for now) |
| `item.honey.fact` | Honey is a liquid too. It's thick and slow, but it still pours! | TO RECORD (computer voice for now) |
| `item.chocolate.name` | A chocolate bar! | TO RECORD (computer voice for now) |
| `item.chocolate.fact` | Chocolate is a solid. It keeps its shape, until it gets warm! | TO RECORD (computer voice for now) |
| `item.meltedChocolate.name` | Melted chocolate! | TO RECORD (computer voice for now) |
| `item.meltedChocolate.fact` | Melted chocolate is a liquid. It pours! | TO RECORD (computer voice for now) |
| `item.butter.name` | A block of butter! | TO RECORD (computer voice for now) |
| `item.butter.fact` | Cold butter is a solid. It keeps its shape. | TO RECORD (computer voice for now) |
| `item.meltedButter.name` | Melted butter! | TO RECORD (computer voice for now) |
| `item.meltedButter.fact` | Melted butter is a liquid. It pours! | TO RECORD (computer voice for now) |
| `item.balloon.name` | Air in a balloon! | TO RECORD (computer voice for now) |
| `item.balloon.fact` | Air is a gas. It spreads out to fill the whole balloon! | TO RECORD (computer voice for now) |
| `item.steam.name` | Steam from a teapot! | TO RECORD (computer voice for now) |
| `item.steam.fact` | Steam is water that turned into a gas. It floats up and spreads out! | TO RECORD (computer voice for now) |
| `item.puff.name` | A puff of air! | TO RECORD (computer voice for now) |
| `item.puff.fact` | When you blow, you push out air. Air is a gas! | TO RECORD (computer voice for now) |
