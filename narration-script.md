# Narration script

**2 of 283 lines recorded.** Lines marked "computer voice for now"
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
| `unmix.intro` | Let's unmix! These are sand and water. Drag the paper filter to the mixture, or tap it. Watch where the sand and water go! | TO RECORD |
| `unmix.welcome` | Pick a mixture and try a separating tool! | TO RECORD |
| `unmix.stickers` | Your separating discoveries! Tap a sticker to hear what happened. | TO RECORD |
| `unmix.allFound` | You found all five ways to separate these mixtures! Pick one to try again. | TO RECORD |
| `unmix.zoom` | The salt water is clear, but the salt is still there! These dots show its tiny dissolved parts, too small to see with a real magnifying glass. | TO RECORD |
| `unmix.crystals` | The water left, and the salt stayed behind as crystals! | TO RECORD |
| `unmix.filterSalt` | The water and dissolved salt both pass through this paper filter. The salt is still in the water! Try letting the water evaporate. | TO RECORD |
| `unmix.pick.filter` | Sand and water! Can you separate the sand from the water? | TO RECORD |
| `unmix.pick.evaporate` | Salt dissolved in water! Can you get the salt back? | TO RECORD |
| `unmix.pick.sieve` | Pebbles mixed with sand! Can you separate the big pieces from the small grains? | TO RECORD |
| `unmix.pick.magnet` | Little iron pieces mixed with sand! What could lift just the iron? | TO RECORD |
| `unmix.pick.skim` | Cork bits floating on water! Can you lift them off the top? | TO RECORD |
| `unmix.hint.filter` | Try the paper filter. Water can pass through, but the sand grains stay behind. | TO RECORD |
| `unmix.hint.evaporate` | Try the sunny windowsill. We'll speed up time while the water evaporates. | TO RECORD |
| `unmix.hint.sieve` | Try the sieve. Its holes let the small sand grains through, but hold the pebbles. | TO RECORD |
| `unmix.hint.magnet` | Try the magnet. It pulls on iron, but not on sand. | TO RECORD |
| `unmix.hint.skim` | Try the skimmer. Lift the cork bits from the top of the water. | TO RECORD |
| `unmix.try.sieve` | This sieve separates big pieces from small grains. For this experiment, let's try a different tool, or tap the light bulb. | TO RECORD |
| `unmix.try.magnet` | The magnet pulls on iron. There's no iron in this mixture. Try another tool, or tap the light bulb. | TO RECORD |
| `unmix.try.filter` | This paper filter catches small solid grains while water flows through. Let's try another tool for this mixture. | TO RECORD |
| `unmix.try.evaporate` | The windowsill can let water evaporate, but it won't separate this mixture into the two parts we're collecting. Try another tool. | TO RECORD |
| `unmix.try.skim` | The skimmer lifts floating bits off water. It won't separate this mixture. Try another tool, or tap the light bulb. | TO RECORD |
| `unmix.action.filter` | The water passes through the paper. The sand grains stay in the filter! | TO RECORD |
| `unmix.action.evaporate` | Time is speeding up on the sunny windowsill. Water evaporates as invisible gas. The dots show where that gas goes! | TO RECORD |
| `unmix.action.sieve` | Shake the sieve! Small sand grains fall through the holes. Big pebbles stay in the sieve! | TO RECORD |
| `unmix.action.magnet` | The magnet pulls the iron away from the sand! | TO RECORD |
| `unmix.action.skim` | The skimmer lifts the floating cork bits off the water! | TO RECORD |
| `unmix.disc.filter` | You separated sand and water! The paper filter caught the sand, and the water passed through. They're still sand and water. | TO RECORD |
| `unmix.disc.evaporate` | You got the salt back! The water evaporated, leaving salt crystals behind. The salt was in the clear water all along. | TO RECORD |
| `unmix.disc.sieve` | You separated pebbles and sand! The sieve separates things by size. Sand fits through the holes, but pebbles don't. | TO RECORD |
| `unmix.disc.magnet` | You separated iron and sand! The magnet pulls on iron, but not on sand. Not all metals stick to magnets. | TO RECORD |
| `unmix.disc.skim` | You separated cork and water! Cork floats, so the skimmer can lift it off the top. | TO RECORD |
| `float.intro` | Will it float or sink? First, make a guess: tap Float or Sink. Then drop it in the water and watch! | TO RECORD |
| `float.welcome` | Float or sink? Let's find out! | TO RECORD |
| `float.guessFirst` | Make a guess first! Float or sink? | TO RECORD |
| `float.guess.float` | You think it will float. Drop it in the water! | TO RECORD |
| `float.guess.sink` | You think it will sink. Drop it in the water! | TO RECORD |
| `float.hint.guess` | Will it stay at the top of the water, or go down to the bottom? Tap Float or Sink. | TO RECORD |
| `float.hint.drop` | Drag it into the water, or tap it to drop it in. | TO RECORD |
| `float.right` | You guessed it! | TO RECORD |
| `float.surprise` | Surprise! | TO RECORD |
| `float.done` | You tested six things! Floating depends on how heavy something is for its size. A big log floats, but a little coin sinks! | TO RECORD |
| `float.ask.cork` | A cork! Will it float or sink? | TO RECORD |
| `float.ask.apple` | An apple! Will it float or sink? | TO RECORD |
| `float.ask.ice` | An ice cube! Will it float or sink? | TO RECORD |
| `float.ask.duck` | A plastic duck! Will it float or sink? | TO RECORD |
| `float.ask.log` | A big, heavy log! Will it float or sink? | TO RECORD |
| `float.ask.rock` | A rock! Will it float or sink? | TO RECORD |
| `float.ask.coin` | A little coin! Will it float or sink? | TO RECORD |
| `float.ask.grape` | A grape! Will it float or sink? | TO RECORD |
| `float.ask.spoon` | A metal spoon! Will it float or sink? | TO RECORD |
| `float.ask.orange` | An orange! Will it float or sink? | TO RECORD |
| `float.ask.peeledOrange` | Now we peel the orange. Will it float or sink without its peel? | TO RECORD |
| `float.fact.cork` | It floats! Cork is full of tiny air pockets, so it's very light for its size. | TO RECORD |
| `float.fact.apple` | It floats! An apple has lots of air inside, so it's lighter than the same amount of water. | TO RECORD |
| `float.fact.ice` | It floats! Ice is a little lighter than the same amount of water, so most of it stays under the water. | TO RECORD |
| `float.fact.duck` | It floats! The plastic duck is hollow and full of air, so it's light for its size. | TO RECORD |
| `float.fact.log` | It floats! A log is big and heavy, but it's light for its size: lighter than the same amount of water. | TO RECORD |
| `float.fact.rock` | It sinks! A rock is heavy for its size: heavier than the same amount of water. | TO RECORD |
| `float.fact.coin` | It sinks! A coin is small, but it's heavy for its size. | TO RECORD |
| `float.fact.grape` | It sinks! A grape is a little heavier than the same amount of water. | TO RECORD |
| `float.fact.spoon` | It sinks! A metal spoon is heavy for its size. | TO RECORD |
| `float.fact.orange` | It floats! The orange peel is full of tiny air pockets. | TO RECORD |
| `float.fact.peeledOrange` | It sinks! Without the peel and its air pockets, the orange is heavier than the same amount of water. | TO RECORD |
| `layers.intro` | Let's make a liquid tower! Pour honey, water, and oil into the tall glass, in any order you like. Drag a bottle to the glass, or tap it. | TO RECORD |
| `layers.welcome` | Pour the three liquids into the glass and watch where they go! | TO RECORD |
| `layers.hint.pour` | Drag a bottle onto the glass, or tap it to pour. | TO RECORD |
| `layers.hint.drop` | Drag something into the glass, or tap it, and watch where it stops. | TO RECORD |
| `layers.poured` | That bottle is already in the glass. | TO RECORD |
| `layers.honey.first` | The honey pours down to the bottom of the glass. | TO RECORD |
| `layers.honey.under` | The honey sinks right down to the bottom! Honey is heavier for its size than water and oil. | TO RECORD |
| `layers.water.first` | The water fills the bottom of the glass. | TO RECORD |
| `layers.water.onHoney` | The water stays on top of the honey. Water is lighter for its size than honey. | TO RECORD |
| `layers.water.underOil` | The water sinks below the oil! Water is heavier for its size than oil. | TO RECORD |
| `layers.water.middle` | The water slips down below the oil, but stays on top of the honey! | TO RECORD |
| `layers.oil.first` | The oil fills the bottom of the glass. | TO RECORD |
| `layers.oil.top` | The oil floats on top! Oil is lighter for its size than water and honey. | TO RECORD |
| `layers.full` | Three layers! Each liquid floats on the ones that are heavier for their size. Now drop things in and see where they stop! | TO RECORD |
| `layers.drop.cork` | The cork floats on the oil, right at the top! It's lighter for its size than all three liquids. | TO RECORD |
| `layers.drop.grape` | The grape sinks through the oil and the water, but it stops on the honey! It's heavier for its size than water, but lighter than honey. | TO RECORD |
| `layers.drop.coin` | The coin sinks all the way to the bottom! It's heavier for its size than all three liquids. | TO RECORD |
| `layers.done` | You built a liquid tower, and found three places where things stop! | TO RECORD |
| `house.intro` | Welcome to the Science House! Tap a room to explore. | TO RECORD (computer voice for now) |
| `room.kitchen` | The kitchen! Sort, heat, cool, and mix things up. | TO RECORD (computer voice for now) |
| `room.lab` | The lab! Build molecules out of atoms. | TO RECORD (computer voice for now) |
| `room.back` | Back to the Science House! | TO RECORD (computer voice for now) |
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
| `undo.intro` | Some changes can be undone, and some can't! Watch each change, then guess: does it go in the can undo box, or the can't undo box? Then we'll test it! | TO RECORD (computer voice for now) |
| `undo.ask` | Can we undo it? Put it in a box! | TO RECORD (computer voice for now) |
| `undo.test` | Let's test it! | TO RECORD (computer voice for now) |
| `undo.right` | You were right! | TO RECORD (computer voice for now) |
| `undo.surprise` | Surprise! | TO RECORD (computer voice for now) |
| `undo.binYes` | Can undo! It can go back the way it was. | TO RECORD (computer voice for now) |
| `undo.binNo` | Can't undo! It changed into something new. | TO RECORD (computer voice for now) |
| `undo.done` | Great testing! You're a real scientist! | TO RECORD (computer voice for now) |
| `chg.meltIce.do` | Watch! We warm up the ice cube. | TO RECORD (computer voice for now) |
| `chg.meltIce.result` | We cooled the water down, and it froze back into ice! Melting can be undone. | TO RECORD (computer voice for now) |
| `chg.freezeWater.do` | Watch! We put some water in the freezer. | TO RECORD (computer voice for now) |
| `chg.freezeWater.result` | We warmed the ice up, and it melted back into water! Freezing can be undone. | TO RECORD (computer voice for now) |
| `chg.meltChocolate.do` | Watch! We warm up the chocolate. | TO RECORD (computer voice for now) |
| `chg.meltChocolate.result` | We cooled the chocolate down, and it got hard again! Melting can be undone. | TO RECORD (computer voice for now) |
| `chg.meltButter.do` | Watch! We warm up the butter. | TO RECORD (computer voice for now) |
| `chg.meltButter.result` | We cooled the butter down, and it turned solid again! Melting can be undone. | TO RECORD (computer voice for now) |
| `chg.dissolveSugar.do` | Watch! We stir sugar into water until it dissolves. | TO RECORD (computer voice for now) |
| `chg.dissolveSugar.result` | We let the sun dry up the water, and the sugar came back as crystals! Dissolving can be undone. | TO RECORD (computer voice for now) |
| `chg.toast.do` | Watch! We heat a slice of bread. | TO RECORD (computer voice for now) |
| `chg.toast.result` | We cooled it down, but it's still toast! The heat made something new, so it can't be undone. | TO RECORD (computer voice for now) |
| `chg.cookEgg.do` | Watch! We cook an egg. | TO RECORD (computer voice for now) |
| `chg.cookEgg.result` | We cooled it down, but the egg stayed cooked! Cooking an egg can't be undone. | TO RECORD (computer voice for now) |
| `chg.bakeCake.do` | Watch! We bake the cake batter. | TO RECORD (computer voice for now) |
| `chg.bakeCake.result` | We cooled it down, but it's still cake! Baking can't be undone. | TO RECORD (computer voice for now) |
| `chg.brownApple.do` | Watch! We leave an apple slice out in the air for a while. | TO RECORD (computer voice for now) |
| `chg.brownApple.result` | We cooled it in the fridge, but it stayed brown! The air changed it into something new, so it can't be undone. | TO RECORD (computer voice for now) |
| `chg.rustNail.do` | Watch! We leave a nail out where it's wet, for a long time. | TO RECORD (computer voice for now) |
| `chg.rustNail.result` | We dried it in the sun, but the rust stayed! Rust is something new, so it can't be undone. | TO RECORD (computer voice for now) |
| `heat.intro` | This thermometer shows how hot or cold it is. Drag it up to warm the ice, and watch the tiny particles up close. The warmer it gets, the faster they move! | TO RECORD (computer voice for now) |
| `heat.pick.water` | Ice! Let's warm it up. | TO RECORD (computer voice for now) |
| `heat.pick.chocolate` | Chocolate! Let's see when it melts. | TO RECORD (computer voice for now) |
| `heat.pick.butter` | Butter! Let's see when it melts. | TO RECORD (computer voice for now) |
| `heat.water.melt` | The ice melted into water! Its particles started sliding past each other. | TO RECORD (computer voice for now) |
| `heat.water.freeze` | The water froze into ice! Its particles slowed down and locked into place. | TO RECORD (computer voice for now) |
| `heat.water.boil` | The water boiled! Its particles are moving so fast they fly apart. That's steam, a gas. | TO RECORD (computer voice for now) |
| `heat.water.condense` | The steam cooled back into water! Its particles slowed down and came back together. | TO RECORD (computer voice for now) |
| `heat.chocolate.melt` | The chocolate melted! Its particles wiggle so fast they slide past each other. | TO RECORD (computer voice for now) |
| `heat.chocolate.freeze` | The chocolate got hard again! Its particles slowed down and locked into place. | TO RECORD (computer voice for now) |
| `heat.butter.melt` | The butter melted! Its particles wiggle so fast they slide past each other. | TO RECORD (computer voice for now) |
| `heat.butter.freeze` | The butter turned solid again! Its particles slowed down and locked into place. | TO RECORD (computer voice for now) |
| `heat.compare.chocolate` | Look at the little pictures on the thermometer! Chocolate needs more warmth to melt than ice does. | TO RECORD (computer voice for now) |
| `heat.compare.butter` | Look at the little pictures on the thermometer! Butter needs more warmth to melt than ice does. | TO RECORD (computer voice for now) |
| `heat.hint.water.melt` | Pick the ice, then drag the thermometer up! | TO RECORD (computer voice for now) |
| `heat.hint.water.boil` | Keep warming the water, all the way up to boiling! | TO RECORD (computer voice for now) |
| `heat.hint.water.freeze` | Melt the ice into water, then drag the thermometer back down! | TO RECORD (computer voice for now) |
| `heat.hint.water.condense` | Boil the water into steam, then cool it back down! | TO RECORD (computer voice for now) |
| `heat.hint.chocolate.melt` | Try the chocolate! Drag the thermometer up. | TO RECORD (computer voice for now) |
| `heat.hint.chocolate.freeze` | Melt the chocolate, then cool it back down! | TO RECORD (computer voice for now) |
| `heat.hint.butter.melt` | Try the butter! Drag the thermometer up. | TO RECORD (computer voice for now) |
| `heat.hint.butter.freeze` | Melt the butter, then cool it back down! | TO RECORD (computer voice for now) |
| `heat.allFound` | You found every change! Now you know how heat makes particles move. | TO RECORD (computer voice for now) |
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
| `lab.vinegarAlone` | The vinegar mixed right into the water. I wonder what happens if you add baking soda too! | TO RECORD (computer voice for now) |
| `lab.bakingSodaAlone` | The baking soda sank to the bottom. I wonder what happens if you add vinegar too! | TO RECORD (computer voice for now) |
| `lab.allFound` | You found every discovery! You're a real scientist! | TO RECORD (computer voice for now) |
| `hint.meltIce` | Try putting the ice cube on the hot plate! | TO RECORD (computer voice for now) |
| `hint.freezeWater` | What happens to water in the freezer? Try it! | TO RECORD (computer voice for now) |
| `hint.boilWater` | Try heating some water on the hot plate! | TO RECORD (computer voice for now) |
| `hint.meltChocolate` | Try warming up the chocolate on the hot plate! | TO RECORD (computer voice for now) |
| `hint.hardenChocolate` | Melt some chocolate, then put it in the freezer! | TO RECORD (computer voice for now) |
| `hint.meltButter` | Try warming up the butter on the hot plate! | TO RECORD (computer voice for now) |
| `hint.hardenButter` | Melt some butter, then cool it down in the freezer! | TO RECORD (computer voice for now) |
| `hint.toast` | What happens to bread on the hot plate? Try it! | TO RECORD (computer voice for now) |
| `hint.toastStays` | Make some toast, then try to turn it back into bread in the freezer! | TO RECORD (computer voice for now) |
| `hint.iceFloats` | Drop an ice cube into the beaker of water! | TO RECORD (computer voice for now) |
| `hint.sugarDissolves` | Put sugar in the water, then stir it with the spoon! | TO RECORD (computer voice for now) |
| `hint.saltDissolves` | Put salt in the water, then stir it with the spoon! | TO RECORD (computer voice for now) |
| `hint.sandSinks` | Put sand in the water, and give it a stir with the spoon! | TO RECORD (computer voice for now) |
| `hint.oilFloats` | Pour some oil into the beaker of water! | TO RECORD (computer voice for now) |
| `hint.fizz` | Put baking soda and vinegar in the beaker together! | TO RECORD (computer voice for now) |
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
| `builder.intro` | Atoms are tiny building blocks. They join together to make molecules. Let's make water! Drag an oxygen atom onto the table. | TO RECORD (computer voice for now) |
| `builder.addH` | Now bring a hydrogen atom right next to the oxygen, so they join! | TO RECORD (computer voice for now) |
| `builder.addH2` | The oxygen has one more bond spot. Add another hydrogen! | TO RECORD (computer voice for now) |
| `builder.free` | Now try the other molecules at the top, or build anything you like! Pull an atom away to break a bond. Tap a plus sign to make a double bond. | TO RECORD (computer voice for now) |
| `builder.full` | That atom's bond spots are all full! | TO RECORD (computer voice for now) |
| `builder.double` | A double bond! The two atoms are joined twice, so each one used up two of its bond spots. | TO RECORD (computer voice for now) |
| `builder.plusTip` | See the plus sign? These two atoms each still have a free bond spot. Tap the plus to join them again. That makes a double bond! | TO RECORD (computer voice for now) |
| `builder.triple` | A triple bond! The two atoms are joined three times. | TO RECORD (computer voice for now) |
| `builder.broken` | You pulled them apart! | TO RECORD (computer voice for now) |
| `builder.cleared` | All clear! | TO RECORD (computer voice for now) |
| `builder.complete` | All the bond spots are filled! That's a complete molecule. | TO RECORD (computer voice for now) |
| `builder.allMade` | You made every molecule on the list! Amazing! | TO RECORD (computer voice for now) |
| `atom.H` | Hydrogen! It has one bond spot. | TO RECORD (computer voice for now) |
| `atom.O` | Oxygen! It has two bond spots. | TO RECORD (computer voice for now) |
| `atom.C` | Carbon! It has four bond spots. | TO RECORD (computer voice for now) |
| `recipe.water` | Water: one oxygen and two hydrogens. | TO RECORD (computer voice for now) |
| `recipe.hydrogen` | Hydrogen gas: two hydrogens joined together. | TO RECORD (computer voice for now) |
| `recipe.oxygen` | Oxygen gas: two oxygens. Join them, then tap the plus sign to join them again with a double bond! | TO RECORD (computer voice for now) |
| `recipe.carbonDioxide` | Carbon dioxide: one carbon in the middle, with an oxygen on each side. Then tap each plus sign to make two double bonds! | TO RECORD (computer voice for now) |
| `recipe.methane` | Methane: one carbon in the middle, with four hydrogens around it. | TO RECORD (computer voice for now) |
| `mol.water` | You made water! One oxygen atom joined to two hydrogen atoms. | TO RECORD (computer voice for now) |
| `mol.hydrogen` | You made hydrogen gas! Two hydrogen atoms joined together. | TO RECORD (computer voice for now) |
| `mol.oxygen` | You made oxygen gas! It's part of the air we breathe in. Two oxygen atoms, joined by a double bond. | TO RECORD (computer voice for now) |
| `mol.carbonDioxide` | You made carbon dioxide! We breathe it out, and plants use it to grow. It's the gas in the baking soda fizz! | TO RECORD (computer voice for now) |
| `mol.methane` | You made methane! It's the gas some stoves burn for cooking. One carbon with four hydrogens. | TO RECORD (computer voice for now) |
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
