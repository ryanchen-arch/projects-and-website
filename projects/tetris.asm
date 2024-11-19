################ CSC258H1F Winter 2024 Assembly Final Project ##################
# This file contains our implementation of Tetris.
#
# Student 1: Jayden Paolo Chiola-Nakai, 1008998872
# Student 2: Ryan Chen, 1008774471
######################## Bitmap Display Configuration ########################
# - Unit width in pixels:       4
# - Unit height in pixels:      4
# - Display width in pixels:    128
# - Display height in pixels:   128
# - Base Address for Display:   0x10008000 ($gp)
##############################################################################

    .data
##############################################################################
# Immutable Data
##############################################################################
# The address of the bitmap display. Don't forget to connect it!
ADDR_DSPL:
    .word 0x10008000
# The address of the keyboard. Don't forget to connect it!
ADDR_KBRD:
    .word 0xffff0000
# literally just the colour purple
PURPLE:
    .word 0xff00ff
# Width of the two border walls
WALL_WIDTH: 
    .word 1
# Height of the two border walls
WALL_HEIGHT: 
    .word 21
# Width of the border floor
FLOOR_WIDTH:
    .word 10
# Height of the border floor
FLOOR_HEIGHT:
    .word 1
# length of the sleep call between each update of the screen
SLEEP_LENGTH:
    .word 200
# an array with 2 spaces that stores the current piece's x and y locations, in that order
CURR_PIECE_XY:
    .space 8
# stores the 'rotation number' of the current piece: can be 0, 1, 2, or 3
CURR_PIECE_ROTATION:
    .word 0
# the number of frames that have passed since the last move down due to gravity
CURR_ITER_GRAVITY:
    .word 0
# the number of iterations until the piece automatically moves down
GRAVITY_ITERATIONS:
    .word 5
# An array with 4096 spots that stores a copy of background grid (16384 is 4069 * 4)
BG_GRID_COPY: 
    .space 16384

##############################################################################
# Mutable Data
##############################################################################

##############################################################################
# Code
##############################################################################
	.text
	.globl main

	# Run the Tetris game.
main:
    # Initialize the game
    lw $t0, ADDR_DSPL
    la $t8, CURR_PIECE_XY
    la $t9, BG_GRID_COPY
    addi $t4, $zero, 5
    sw $t4, GRAVITY_ITERATIONS  # reset gravity to 5
    addi $t4, $zero, 0
    
    
    # the leftmost border wall
    addi $a0, $zero, 10
    addi $a1, $zero, 6
    lw $a2, WALL_HEIGHT
    jal draw_vertical_border_line
    
    # rightmost border wall
    addi $a0, $zero, 21
    addi $a1, $zero, 6
    lw $a2, WALL_HEIGHT
    jal draw_vertical_border_line
    
    # border floor
    addi $a0, $zero, 11
    addi $a1, $zero, 26
    lw $a2, FLOOR_WIDTH
    jal draw_horizontal_border_line
    
    jal add_random_lines
    
    # initial score
    addi $s0, $zero, 0
    addi $s1, $zero, 0  # if this reaches 5, increase gravity
    addi $s2, $zero, 25 # initial y position
    addi $s3, $zero, 5 # initial x position
    jal draw_zero
    addi $s3, $zero, 0  # x position for the second digit
    jal draw_zero
    addi $s3, $zero, 5
    
    beq $s7, $zero, initial_high_score  # if curr high score is 0, set initial high score
    j new_tetromino
    initial_high_score:
    # initial high score
    addi $s7, $zero, 0  # set initial high score to 0
    addi $s3, $zero, 29
    jal draw_zero
    addi $s3, $zero, 24
    jal draw_zero
    add $s3, $zero, 5 # reset s3 to x position of scoreboard
    
    # initial tetromino, we can make this random if we want or just keep it as the T tetromino
    new_tetromino:
    addi $a0, $zero, 15
    addi $a1, $zero, 6
    addi $a2, $zero, 0
    addi $a3, $zero, 0xff00ff
    jal draw_t_tetromino
    j game_loop


game_loop:
	# 1a. Check if key has been pressed
	lw $t1, ADDR_KBRD
	lw $t2, 0($t1) # temporarily store whether a key has been pressed or not in $t2
	beq $t2, $zero, collision_check # if no key has been pressed, move on to collision check right away
    # 1b. Check which key has been pressed
    lw $t2, 4($t1) # now, store the value of the key pressed in $t2 
    # 2a. Check for collisions
    collision_check:
	# 2b. Update locations (paddle, ball)
	# we will check for all the relevant keys: w, a, s, d, and q for quit
    beq $t2, 'w', key_press_w
    beq $t2, 'a', key_press_a
    beq $t2, 's', handle_s
    beq $t2, 'd', key_press_d
    beq $t2, 'q', key_press_q
    beq $t2, 'p', key_press_p
    j sleep # if no relevant key was pressed, just go to sleep
    
    key_press_p:
    jal draw_pause_message
    pause_loop:
    lw $t1, ADDR_KBRD
	lw $t2, 0($t1) # temporarily store whether a key has been pressed or not in $t2
	beq $t2, $zero, pause_sleep # if nothing pressed, sleep
	lw $t2, 4($t1) # now, store the value of the key pressed in $t2 
	beq $t2, 'p', pause_done # if they press p again, pause is done
	pause_sleep:
	li $v0, 32 # want to invoke the sleep syscall
    lw $a0, SLEEP_LENGTH # update screen every half second, could be adjusted if we want
    syscall
    
    b pause_loop
	pause_done:
	jal erase_pause_message # erase pause message
	b game_loop # go back into the game loop
	
    key_press_w:
    lw $a0, 0($t8) # load in x coordinate of current piece
    lw $a1, 4($t8) # load in y coordinate of current piece
    lw $a2, CURR_PIECE_ROTATION # load in rotation number of current piece
    li $t6, 1
    beq $a2, $t6, check_1_3_edge # checks if rotation is 1
    addi $t6, $t6, 2
    beq $a2, $t6, check_1_3_edge# checks if rotation is 3
    j draw_new
    check_1_3_edge: # checks if rotating the tetromino is valid for rotation 1 and 3
    sll $t2, $a1, 7 # convert y coordinate to pixel row by multiplying by 128
    sll $t1, $a0, 2 # convert horizontal offset to pixels
    add $t3, $t1, $t2 # calculate total offset for first pixel
    add $t4, $t9, $t3 # calculate where the first pixel goes in our copy of the background, stored in an array with address starting at $t9
    add $t3, $t0, $t3 # calculate where the first pixel goes in memory
    lw $t5, 8($t3) # first pixel right of the tetromino
    #lw $t5, 8($t4) # first pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 8($t3) # second pixel right of the tetromino
    #lw $t5, 8($t4) # second pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    draw_new:
    lw $t6, 0($t8)
    jal erase_t_tetromino
    lw $a0, 0($t8) # load in x coordinate of current piece
    lw $a1, 4($t8) # load in y coordinate of current piece
    lw $a2, CURR_PIECE_ROTATION # load in rotation number of current piece
    addi $a2, $a2, 1 # increment rotation number by 1
    li $t5, 4 # using t5 to check if rotation number has gone past 3
    lw $a3, PURPLE # color purple
    beq $a2, $t5, rotation_overflow
    jal draw_t_tetromino
    j sleep
    rotation_overflow:
    li $a2, 0 # if rotation number is greater than 3, reset it to 0 
    jal draw_t_tetromino
    j sleep
    
    key_press_a:
    lw $a0, 0($t8) # load in x coordinate of current piece
    lw $a1, 4($t8) # load in y coordinate of current piece
    lw $a2, CURR_PIECE_ROTATION # load in rotation number of current piece
    li $t6, 0
    sll $t2, $a1, 7 # convert y coordinate to pixel row by multiplying by 128
    sll $t1, $a0, 2 # convert horizontal offset to pixels
    add $t3, $t1, $t2 # calculate total offset for first pixel
    add $t4, $t9, $t3 # calculate where the first pixel goes in our copy of the background, stored in an array with address starting at $t9
    add $t3, $t0, $t3 # calculate where the first pixel goes in memory
    beq $a2, $t6, check_0_edge_left # checks if rotation is 0
    addi $t6, $t6, 1
    beq $a2, $t6, check_1_edge_left # checks if rotation is 1
    addi $t6, $t6, 1
    beq $a2, $t6, check_2_edge_left # checks if rotation is 2
    addi $t6, $t6, 1
    beq $a2, $t6, check_3_edge_left # checks if rotation is 3
    check_0_edge_left: # checks if moving the tetromino is valid for rotation 0
    lw $t5, -4($t3) # first pixel left of the tetromino
    #lw $t5, -4($t4) # first pixel copy left of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 0($t3) # second pixel left of the tetromino
    #lw $t5, 0($t4) # second pixel copy left of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    j draw_new_a
    check_1_edge_left: # checks if moving the tetromino is valid for rotation 1
    lw $t5, 0($t3) # first pixel left of the tetromino
    #lw $t5, 0($t4) # first pixel copy left of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, -4($t3) # second pixel left of the tetromino
    #lw $t5, -4($t4) # second pixel copy left of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 0($t3) # third pixel left of the tetromino
    #lw $t5, 0($t4) # third pixel copy left of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    j draw_new_a
    check_2_edge_left: # checks if moving the tetromino is valid for rotation 2
    lw $t5, 0($t3) # first pixel left of the tetromino
    #lw $t5, 0($t4) # first pixel copy left of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, -4($t3) # second pixel left of the tetromino
    #lw $t5, -4($t4) # second pixel copy left of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    j draw_new_a
    check_3_edge_left: # checks if moving the tetromino is valid for rotation 3
    lw $t5, -4($t3) # first pixel left of the tetromino
    #lw $t5, -4($t4) # first pixel copy left of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, -4($t3) # second pixel left of the tetromino
    #lw $t5, -4($t4) # second pixel copy left of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, -4($t3) # third pixel left of the tetromino
    #lw $t5, -4($t4) # third pixel copy left of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    j draw_new_a
    draw_new_a:
    jal erase_t_tetromino
    lw $a0, 0($t8) # load in x coordinate of current piece
    addi $a0, $a0, -1 # shift x coordinate by -1 to move the piece one pixel to the left
    lw $a1, 4($t8) # load in y coordinate of current piece
    lw $a2, CURR_PIECE_ROTATION # load rotation number of current piece
    lw $a3, PURPLE # color purple
    jal draw_t_tetromino
    j sleep
    
    handle_s:
    jal key_press_s
    after_press_s:
    j sleep
    
    key_press_d:
    lw $a0, 0($t8) # load in x coordinate of current piece
    lw $a1, 4($t8) # load in y coordinate of current piece
    lw $a2, CURR_PIECE_ROTATION # load in rotation number of current piece
    li $t6, 0
    sll $t2, $a1, 7 # convert y coordinate to pixel row by multiplying by 128
    sll $t1, $a0, 2 # convert horizontal offset to pixels
    add $t3, $t1, $t2 # calculate total offset for first pixel
    add $t4, $t9, $t3 # calculate where the first pixel goes in our copy of the background, stored in an array with address starting at $t9
    add $t3, $t0, $t3 # calculate where the first pixel goes in memory
    beq $a2, $t6, check_0_edge_right # checks if rotation is 0
    addi $t6, $t6, 1
    beq $a2, $t6, check_1_edge_right # checks if rotation is 1
    addi $t6, $t6, 1
    beq $a2, $t6, check_2_edge_right # checks if rotation is 2
    addi $t6, $t6, 1
    beq $a2, $t6, check_3_edge_right # checks if rotation is 3
    check_0_edge_right: # checks if rotating the tetromino is valid for rotation 0
    lw $t5, 12($t3) # first pixel right of the tetromino
    #lw $t5, 12($t4) # first pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 8($t3) # second pixel right of the tetromino
    #lw $t5, 8($t4) # second pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    j draw_new_d
    check_3_edge_right: # checks if rotating the tetromino is valid for rotation 3
    lw $t5, 4($t3) # first pixel right of the tetromino
    #lw $t5, 4($t4) # first pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 8($t3) # second pixel right of the tetromino
    #lw $t5, 8($t4) # second pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 4($t3) # third pixel right of the tetromino
    #lw $t5, 4($t4) # third pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    j draw_new_d
    check_2_edge_right: # checks if rotating the tetromino is valid for rotation 2
    lw $t5, 8($t3) # first pixel right of the tetromino
    #lw $t5, 8($t4) # first pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 12($t3) # second pixel right of the tetromino
    #lw $t5, 12($t4) # second pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    j draw_new_d
    check_1_edge_right: # checks if rotating the tetromino is valid for rotation 1
    lw $t5, 8($t3) # first pixel right of the tetromino
    #lw $t5, 8($t4) # first pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 8($t3) # second pixel right of the tetromino
    #lw $t5, 8($t4) # second pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 8($t3) # third pixel right of the tetromino
    #lw $t5, 8($t4) # third pixel copy right of the tetromino
    beq $t5, 0xffffff, sleep
    beq $t5, 0xff00ff, sleep
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    j draw_new_d
    draw_new_d:
    jal erase_t_tetromino
    lw $a0, 0($t8) # load in x coordinate of current piece
    addi $a0, $a0, 1 # shift x coordinate by 1 to move the piece one pixel to the left
    lw $a1, 4($t8) # load in y coordinate of current piece
    lw $a2, CURR_PIECE_ROTATION # load rotation number of current piece
    lw $a3, PURPLE # color purple
    jal draw_t_tetromino
    j sleep
    key_press_q:
    li $v0, 10 # terminate the program
    syscall
	# 3. Draw the screen
	# 4. Sleep
	sleep:
	lw $t3, CURR_ITER_GRAVITY # load the iteration number into t3
	lw $t4, GRAVITY_ITERATIONS # load the number of iterations until the piece automatically moves down into t4
	addi $t3, $t3, 1 # increase iteration number by 1
	bge $t3, $t4, iteration_overflow # if t3 and t4 are now equal, go to iteration_overflow to move the piece down and reset CURR_ITER_GRAVITY
	sw $t3, CURR_ITER_GRAVITY # if t3 and t4 are not equal, update CURR_ITER_GRAVITY
	j after_overflow_check # just sleep now
	iteration_overflow:
	jal key_press_s # move the piece down
	cont_iteration_overflow:
	li $t3, 0 # reset t3 to 0
	sw $t3, CURR_ITER_GRAVITY # store 0 into CURR_ITER_GRAVITY
	after_overflow_check:
	li $v0, 32 # want to invoke the sleep syscall
    lw $a0, SLEEP_LENGTH # update screen every half second, could be adjusted if we want
    syscall

    #5. Go back to 1
    b game_loop

# draw a line for the border
# - a0: x coordinate of the first pixel of the line
# - a1: y coordinate of first pixel
# - a2: height of the line 
draw_vertical_border_line:
    sll $t1, $a0, 2 # convert x coordinate to pixels 
    sll $t2, $a1, 7 # convert y coordinate to pixels
    add $t3, $t2, $t1 # total offset stored in t3
    addi $t4, $zero, 0 # t4 will be our loop variable
    addi $t5, $zero, 0xffffff # store white in t5
    addi $t6, $t0, 0 # t6 will store where the next pixel is in memory
    add $t6, $t6, $t3 # t6 now stores address of first pixel in memory
    vertical_border_line_loop:
    beq $t4, $a2, vertical_border_line_loop_done
    sw $t5, 0($t6) # store white in the address stored in t6
    addi $t6, $t6, 128 # move down a line
    addi $t4, $t4, 1 # increment t4 by 1
    b vertical_border_line_loop
    vertical_border_line_loop_done:
    jr $ra
    
# draw a horizontal line for the border
# - a0: x coordinate of the first pixel of the line
# - a1: y coordinate of first pixel
# - a2: length of the line 
draw_horizontal_border_line:
    sll $t1, $a0, 2 # convert x coordinate to pixels 
    sll $t2, $a1, 7 # convert y coordinate to pixels
    add $t3, $t2, $t1 # total offset stored in t3
    addi $t4, $zero, 0 # t4 will be our loop variable
    addi $t5, $zero, 0xffffff # store white in t5
    addi $t6, $t0, 0 # t6 will store where the next pixel is in memory
    add $t6, $t6, $t3 # t6 now stores address of first pixel in memory
    horizontal_border_line_loop:
    beq $t4, $a2, vertical_border_line_loop_done
    sw $t5, 0($t6) # store white in the address stored in t6
    addi $t6, $t6, 4 # move to next pixel
    addi $t4, $t4, 1 # increment t4 by 1
    b horizontal_border_line_loop
    horizontal_border_line_loop_done:
    jr $ra

    
# draws the number 0 as current score
# a0 is the x-location of the leftmost pixel of 0 
# a1 is the y-location of the leftmost pixel of 0
draw_zero:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t4, $zero, 0xffffff
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
jr $ra # jump back to the code

# draws the number 1 as current score
# a0 is the x-location of the leftmost pixel of 1 
# a1 is the y-location of the leftmost pixel of 1
draw_one:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t4, $zero, 0xffffff
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
jr $ra # jump back to the code

# draws the number 2 as current score
# a0 is the x-location of the leftmost pixel of 2
# a1 is the y-location of the leftmost pixel of 2
draw_two:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t4, $zero, 0xffffff
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
jr $ra # jump back to the code

# draws the number 3 as current score
# a0 is the x-location of the leftmost pixel of 3
# a1 is the y-location of the leftmost pixel of 3
draw_three:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t4, $zero, 0xffffff
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
jr $ra # jump back to the code

# draws the number 4 as current score
# a0 is the x-location of the leftmost pixel of 4
# a1 is the y-location of the leftmost pixel of 4
draw_four:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t4, $zero, 0xffffff
sw $t4, 0($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
jr $ra # jump back to the code

# draws the number 5 as current score
# a0 is the x-location of the leftmost pixel of 5
# a1 is the y-location of the leftmost pixel of 5
draw_five:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t4, $zero, 0xffffff
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
jr $ra # jump back to the code

# draws the number 6 as current score
# a0 is the x-location of the leftmost pixel of 6
# a1 is the y-location of the leftmost pixel of 6
draw_six:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t4, $zero, 0xffffff
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
jr $ra # jump back to the code

# draws the number 7 as current score
# a0 is the x-location of the leftmost pixel of 7
# a1 is the y-location of the leftmost pixel of 7
draw_seven:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t4, $zero, 0xffffff
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
jr $ra # jump back to the code

# draws the number 8 as current score
# a0 is the x-location of the leftmost pixel of 8
# a1 is the y-location of the leftmost pixel of 8
draw_eight:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t4, $zero, 0xffffff
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
jr $ra # jump back to the code

# draws the number 9 as current score
# a0 is the x-location of the leftmost pixel of 9
# a1 is the y-location of the leftmost pixel of 9
draw_nine:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t4, $zero, 0xffffff
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 8($t1)
addi $t1, $t1, 128
sw $t4, 0($t1)
sw $t4, 4($t1)
sw $t4, 8($t1)
jr $ra # jump back to the code

# erase current score
# a0 is the x-location of the leftmost pixel of 8
# a1 is the y-location of the leftmost pixel of 8
erase_score:
add $t2, $zero, $s2 # s2 is the y position of the number to be drawn
add $t1, $zero, $s3 # s1 is the x position of the number to be drawn
sll $t2, $t2, 7 # convert y coordinate to pixel row by multiplying by 128
sll $t1, $t1, 2 # convert horizontal offset to pixels
add $t1, $t1, $t2 # calculate total offset for first pixel
add $t1, $t0, $t1 # calculate where the first pixel goes in memory
addi $t9, $zero, 0x0
sw $t9, 0($t1)
sw $t9, 4($t1)
sw $t9, 8($t1)
addi $t1, $t1, 128
sw $t9, 0($t1)
sw $t9, 8($t1)
addi $t1, $t1, 128
sw $t9, 0($t1)
sw $t9, 4($t1)
sw $t9, 8($t1)
addi $t1, $t1, 128
sw $t9, 0($t1)
sw $t9, 8($t1)
addi $t1, $t1, 128
sw $t9, 0($t1)
sw $t9, 4($t1)
sw $t9, 8($t1)
jr $ra # jump back to the code

# draws the t tetromino
# - a0: the x coordinate of the 3x2 rectangle where the tetromino will be drawn
# - a1: the y coordinate of the rectangle
# - a2: the rotation number: either 0, 1, 2, or 3
# - a3: the colour of the tetromino
# - t0: top left of bitmap
# - t1: horizontal offset of first pixel
# - t2: vertical offset of first pixel 
# - t3: location in bitmap to draw current pixel
draw_t_tetromino:
    sw $a0, 0($t8) # store x coordinate of current piece in memory
    sw $a1, 4($t8) # store y coordinate of current piece in memory
    la $t7, CURR_PIECE_ROTATION # store the address of rotation number of the piece in t7 temporarily
    sw $a2, 0($t7)  # store rotation number of current piece
    sll $t2, $a1, 7 # convert y coordinate to pixel row by multiplying by 128
    sll $t1, $a0, 2 # convert horizontal offset to pixels
    
    add $t3, $t1, $t2 # calculate total offset for first pixel
    add $t4, $t9, $t3 # calculate where the first pixel goes in our copy of the background, stored in an array with address starting at $t9
    add $t3, $t0, $t3 # calculate where the first pixel goes in memory
    
    li $t6, 0 # we'll temporarily use t6 to compare rotation number
    
    beq $a2, $t6, t_rotation_0
    addi $t6, $t6, 1
    beq $a2, $t6, t_rotation_1
    addi $t6, $t6, 1
    beq $a2, $t6, t_rotation_2
    addi $t6, $t6, 1
    beq $a2, $t6, t_rotation_3
    
    t_rotation_0:
    sw $a3, 0($t3) # first pixel 
    #sw $a3, 0($t4) # first pixel copy 
    sw $a3, 4($t3) # second pixel
    #sw $a3, 4($t4) # second pixel copy
    sw $a3, 8($t3) # third pixel
    #sw $a3, 8($t4) # third pixel copy
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $a3, 4($t3) # draw the last pixel of the T
    #sw $a3, 4($t4) # last pixel of T copy
    j t_return
    
    t_rotation_1:
    sw $a3, 4($t3) # first pixel 
    #sw $a3, 4($t4) # first pixel copy 
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $a3, 0($t3) # second pixel
    #sw $a3, 0($t4) # second pixel copy
    sw $a3, 4($t3) # third pixel
    #sw $a3, 4($t4) # third pixel copy
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $a3, 4($t3) # draw the last pixel of the T
    #sw $a3, 4($t4) # last pixel of T copy
    j t_return
    
    t_rotation_2:
    sw $a3, 4($t3) # first pixel 
    #sw $a3, 4($t4) # first pixel copy 
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $a3, 0($t3) # second pixel
    #sw $a3, 0($t4) # second pixel copy
    sw $a3, 4($t3) # third pixel
    #sw $a3, 4($t4) # third pixel copy
    sw $a3, 8($t3) # draw the last pixel of the T
    #sw $a3, 8($t4) # last pixel of T copy
    j t_return
    
    t_rotation_3:
    sw $a3, 0($t3) # first pixel 
    #sw $a3, 0($t4) # first pixel copy 
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $a3, 0($t3) # second pixel
    #sw $a3, 0($t4) # second pixel copy
    sw $a3, 4($t3) # third pixel
    #sw $a3, 4($t4) # third pixel copy
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $a3, 0($t3) # draw the last pixel of the T
    #sw $a3, 0($t4) # last pixel of T copy
    j t_return
    
    t_return:
    jr $ra # jump back to the code
    
# erases the t tetromino (just makes the purple pixels black)
# - a0: the x coordinate of the 3x2 rectangle where the tetromino will be drawn
# - a1: the y coordinate of the rectangle
# - a2: the rotation number: either 0, 1, 2, or 3
# - t0: top left of bitmap
# - t1: horizontal offset of first pixel
# - t2: vertical offset of first pixel 
# - t3: location in bitmap to draw current pixel
# - t4: location in background copy array of current pixel
# - t5: the colour black
erase_t_tetromino:
    sw $a0, 0($t8) # store x coordinate of current piece in memory
    sw $a1, 4($t8) # store y coordinate of current piece in memory
    la $t7, CURR_PIECE_ROTATION # store the address of rotation number of the piece in t7 temporarily
    sw $a2, 0($t7)  # store rotation number of current piece
    sll $t2, $a1, 7 # convert y coordinate to pixel row by multiplying by 128
    sll $t1, $a0, 2 # convert horizontal offset to pixels
    
    add $t3, $t1, $t2 # calculate total offset for first pixel
    add $t4, $t9, $t3 # calculate where the first pixel goes in our copy of the background, stored in an array with address starting at $t9
    add $t3, $t0, $t3 # calculate where the first pixel goes in memory
    
    li $t5, 0x000000 # store the colour black in t5 
    
    li $t6, 0 # we'll temporarily use t6 to compare rotation number
    
    beq $a2, $t6, t_rotation_0_e
    addi $t6, $t6, 1
    beq $a2, $t6, t_rotation_1_e
    addi $t6, $t6, 1
    beq $a2, $t6, t_rotation_2_e
    addi $t6, $t6, 1
    beq $a2, $t6, t_rotation_3_e
    
    t_rotation_0_e:
    sw $t5, 0($t3) # first pixel 
    #sw $t5, 0($t4) # first pixel copy 
    sw $t5, 4($t3) # second pixel
    #sw $t5, 4($t4) # second pixel copy
    sw $t5, 8($t3) # third pixel
    #sw $t5, 8($t4) # third pixel copy
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $t5, 4($t3) # draw the last pixel of the T
    #sw $t5, 4($t4) # last pixel of T copy
    j t_return_e
    
    t_rotation_1_e:
    sw $t5, 4($t3) # first pixel 
    #sw $t5, 4($t4) # first pixel copy 
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $t5, 0($t3) # second pixel
    #sw $t5, 0($t4) # second pixel copy
    sw $t5, 4($t3) # third pixel
    #sw $t5, 4($t4) # third pixel copy
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $t5, 4($t3) # draw the last pixel of the T
    #sw $t5, 4($t4) # last pixel of T copy
    j t_return_e
    
    t_rotation_2_e:
    sw $t5, 4($t3) # first pixel 
    #sw $t5, 4($t4) # first pixel copy 
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $t5, 0($t3) # second pixel
    #sw $t5, 0($t4) # second pixel copy
    sw $t5, 4($t3) # third pixel
    #sw $t5, 4($t4) # third pixel copy
    sw $t5, 8($t3) # draw the last pixel of the T
    #sw $t5, 8($t4) # last pixel of T copy
    j t_return_e
    
    t_rotation_3_e:
    sw $t5, 0($t3) # first pixel 
    #sw $t5, 0($t4) # first pixel copy 
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $t5, 0($t3) # second pixel
    #sw $t5, 0($t4) # second pixel copy
    sw $t5, 4($t3) # third pixel
    #sw $t5, 4($t4) # third pixel copy
    addi $t3, $t3, 128 # go down one row
    #addi $t4, $t4, 128 # down one row in bg copy
    sw $t5, 0($t3) # draw the last pixel of the T
    #sw $t5, 0($t4) # last pixel of T copy
    j t_return_e
    
    t_return_e:
    jr $ra # jump back to the code
    

# handles the s key being pressed
key_press_s:
    lw $a0, 0($t8) # load in x coordinate of current piece
    lw $a1, 4($t8) # load in y coordinate of current piece
    lw $a2, CURR_PIECE_ROTATION # load in rotation number of current piece
    li $t6, 0
    sll $t2, $a1, 7 # convert y coordinate to pixel row by multiplying by 128
    sll $t1, $a0, 2 # convert horizontal offset to pixels
    add $t3, $t1, $t2 # calculate total offset for first pixel
    add $t4, $t9, $t3 # calculate where the first pixel goes in our copy of the background, stored in an array with address starting at $t9
    add $t3, $t0, $t3 # calculate where the first pixel goes in memory
    beq $a2, $t6, check_0_edge_bottom # checks if rotation is 0
    addi $t6, $t6, 1
    beq $a2, $t6, check_1_edge_bottom # checks if rotation is 1
    addi $t6, $t6, 1
    beq $a2, $t6, check_2_edge_bottom # checks if rotation is 2
    addi $t6, $t6, 1
    beq $a2, $t6, check_3_edge_bottom # checks if rotation is 3
    check_0_edge_bottom: # checks if moving the tetromino is valid for rotation 0
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 0($t3) # second pixel left of the tetromino
    #lw $t5, 0($t4) # second pixel copy left of the tetromino
    beq $t5, 0xffffff, check_completed_lines_updated
    beq $t5, 0xff00ff, check_completed_lines_updated
    lw $t5, 8($t3) # second pixel right of the tetromino
    #lw $t5, 8($t4) # second pixel copy right of the tetromino
    beq $t5, 0xffffff, check_completed_lines_updated
    beq $t5, 0xff00ff, check_completed_lines_updated
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 4($t3) # pixel right below the tetromino
    #lw $t5, 4($t4) # pixel copy right below the tetromino
    beq $t5, 0xffffff, check_completed_lines_updated
    beq $t5, 0xff00ff, check_completed_lines_updated
    j draw_new_s
    check_3_edge_bottom: # checks if moving the tetromino is valid for rotation 3
    addi $t3, $t3, 256 # go down two row
    addi $t4, $t4, 256 # down two row in bg copy
    lw $t5, 4($t3) # third pixel right of the tetromino
    #lw $t5, 4($t4) # third pixel copy right of the tetromino
    beq $t5, 0xffffff, check_completed_lines_updated
    beq $t5, 0xff00ff, check_completed_lines_updated
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 0($t3) # first pixel bottom of the tetromino
    #lw $t5, 0($t4) # first copy pixel bottom of the tetromino
    beq $t5, 0xffffff, check_completed_lines_updated
    beq $t5, 0xff00ff, check_completed_lines_updated
    j draw_new_s
    check_2_edge_bottom: # checks if moving the tetromino is valid for rotation 2
    addi $t3, $t3, 256 # go down two row
    addi $t4, $t4, 256 # down two row in bg copy
    lw $t5, 0($t3) # first pixel bottom of the tetromino
    #lw $t5, 0($t4) # first pixel copy bottom of the tetromino
    beq $t5, 0xffffff, check_completed_lines_updated
    beq $t5, 0xff00ff, check_completed_lines_updated
    lw $t5, 4($t3) # second pixel bottom of the tetromino
    #lw $t5, 4($t4) # second pixel copy bottom of the tetromino
    beq $t5, 0xffffff, check_completed_lines_updated
    beq $t5, 0xff00ff, check_completed_lines_updated
    lw $t5, 8($t3) # third pixel bottom of the tetromino
    #lw $t5, 8($t4) # third pixel copy bottom of the tetromino
    beq $t5, 0xffffff, check_completed_lines_updated
    beq $t5, 0xff00ff, check_completed_lines_updated
    j draw_new_s
    check_1_edge_bottom: # checks if moving the tetromino is valid for rotation 1
    addi $t3, $t3, 256 # go down two row
    addi $t4, $t4, 256 # down two row in bg copy
    lw $t5, 0($t3) # third pixel left of the tetromino
    #lw $t5, 0($t4) # third pixel copy left of the tetromino
    beq $t5, 0xffffff, check_completed_lines_updated
    beq $t5, 0xff00ff, check_completed_lines_updated
    addi $t3, $t3, 128 # go down one row
    addi $t4, $t4, 128 # down one row in bg copy
    lw $t5, 4($t3) # second pixel bottom of the tetromino
    #lw $t5, 4($t4) # second pixel copy bottom of the tetromino
    beq $t5, 0xffffff, check_completed_lines_updated
    beq $t5, 0xff00ff, check_completed_lines_updated
    j draw_new_s
    draw_new_s:
    add $s4, $ra, $zero
    jal erase_t_tetromino
    lw $a0, 0($t8) # load in x coordinate of current piece
    lw $a1, 4($t8) # load in y coordinate of current piece
    addi $a1, $a1, 1 # shift y coordinate by 1 to move the piece one pixel down
    lw $a2, CURR_PIECE_ROTATION # load rotation number of current piece
    lw $a3, PURPLE # color purple
    jal draw_t_tetromino
    lw $t5, 128($t3) # check if new tetromino is at last line
    beq $t5, 0xffffff, key_press_s
    beq $t5, 0xff00ff, key_press_s
    j cont_iteration_overflow
    
# this function will draw the word "PAUSED" onto the bitmap 
# the pause message is just complely hard coded for all 5 rows so this will be long
draw_pause_message: 
    li $t1, 0x0000ff # pause message will be blue I guess
    first_row_paused:
    # P
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    sw $t1, 28($t0)
    # A
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    sw $t1, 44($t0)
    # U
    sw $t1, 52($t0)
    sw $t1, 60($t0)
    #S
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    #E 
    sw $t1, 84($t0)
    sw $t1, 88($t0)
    sw $t1, 92($t0)
    # D
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    
    second_row_paused:
    addi $t0, $t0, 128
    # P
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # A
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # U
    sw $t1, 52($t0)
    sw $t1, 60($t0)
    #S
    sw $t1, 68($t0)
    #E 
    sw $t1, 84($t0)
    # D
    sw $t1, 100($t0)
    sw $t1, 108($t0)
    
    third_row_paused:
    addi $t0, $t0, 128
    # P
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    sw $t1, 28($t0)
    # A
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    sw $t1, 44($t0)
    # U
    sw $t1, 52($t0)
    sw $t1, 60($t0)
    #S
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    #E 
    sw $t1, 84($t0)
    sw $t1, 88($t0)
    # D
    sw $t1, 100($t0)
    sw $t1, 108($t0)
    
    fourth_row_paused:
    addi $t0, $t0, 128
    # P
    sw $t1, 20($t0)
    # A
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # U
    sw $t1, 52($t0)
    sw $t1, 60($t0)
    #S
    sw $t1, 76($t0)
    #E 
    sw $t1, 84($t0)
    # D
    sw $t1, 100($t0)
    sw $t1, 108($t0)
    
    fifth_row_paused:
    addi $t0, $t0, 128
    # P
    sw $t1, 20($t0)
    # A
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # U
    sw $t1, 52($t0)
    sw $t1, 56($t0)
    sw $t1, 60($t0)
    #S
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    #E 
    sw $t1, 84($t0)
    sw $t1, 88($t0)
    sw $t1, 92($t0)
    # D
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    
    lw $t0, ADDR_DSPL
    
    jr $ra
    
# this function will erase the "PAUSED" message
# the pause message is just complely hard coded for all 5 rows so this will be long
erase_pause_message: 
    li $t1, 0x000000 # erase message by painting black over it
    e_first_row_paused:
    # P
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    sw $t1, 28($t0)
    # A
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    sw $t1, 44($t0)
    # U
    sw $t1, 52($t0)
    sw $t1, 60($t0)
    #S
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    #E 
    sw $t1, 84($t0)
    sw $t1, 88($t0)
    sw $t1, 92($t0)
    # D
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    
    e_second_row_paused:
    addi $t0, $t0, 128
    # P
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # A
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # U
    sw $t1, 52($t0)
    sw $t1, 60($t0)
    #S
    sw $t1, 68($t0)
    #E 
    sw $t1, 84($t0)
    # D
    sw $t1, 100($t0)
    sw $t1, 108($t0)
    
    e_third_row_paused:
    addi $t0, $t0, 128
    # P
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    sw $t1, 28($t0)
    # A
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    sw $t1, 44($t0)
    # U
    sw $t1, 52($t0)
    sw $t1, 60($t0)
    #S
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    #E 
    sw $t1, 84($t0)
    sw $t1, 88($t0)
    # D
    sw $t1, 100($t0)
    sw $t1, 108($t0)
    
    e_fourth_row_paused:
    addi $t0, $t0, 128
    # P
    sw $t1, 20($t0)
    # A
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # U
    sw $t1, 52($t0)
    sw $t1, 60($t0)
    #S
    sw $t1, 76($t0)
    #E 
    sw $t1, 84($t0)
    # D
    sw $t1, 100($t0)
    sw $t1, 108($t0)
    
    e_fifth_row_paused:
    addi $t0, $t0, 128
    # P
    sw $t1, 20($t0)
    # A
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # U
    sw $t1, 52($t0)
    sw $t1, 56($t0)
    sw $t1, 60($t0)
    #S
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    #E 
    sw $t1, 84($t0)
    sw $t1, 88($t0)
    sw $t1, 92($t0)
    # D
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    
    lw $t0, ADDR_DSPL
    
    jr $ra
    
# adds 5 random lines to the playing field at the start of the game
add_random_lines:
    li $t1, 5 # number of iterations that the outer loop will go through
    li $t2, 10 # number of iterations that the inner loop will go through
    li $t3, 0 # outer loop variable
    li $t4, 0 # inner loop variable
    add $t5, $t0, $zero # put the bitmap display address into t5
    addi $t5, $t5, 3200 # move t5 to the bottom row of the border
    addi $t5, $t5, 44 # get inside the border
    lw $t6, PURPLE # put purple into t6
    
    outer_loop_random:
    beq $t1, $t3, outer_loop_random_done
    # generate random number between 0 and 9
    li $v0, 42
    li $a0, 0
    li $a1, 10
    syscall 
    # random number is stored in a0
    inner_loop_random:
    beq $t2, $t4, inner_loop_random_done # if t4 is 10
    beq $a0, $t4, random_colour_done # if t4 is equal to random number we generated, don't paint purple there
    sw $t6, 0($t5) # paint purple if t4 is not equal to a0
    random_colour_done:
    addi $t5, $t5, 4 # move t5 along by 4 to get to the next pixel
    addi $t4, $t4, 1 # increment t4 by 1
    b inner_loop_random
    inner_loop_random_done:
    li $t4, 0 # reset inner loop variable for next loop
    addi $t3, $t3, 1 # increment outer loop variable by 1
    addi $t5, $t5, -40 # go back to the leftmost pixel in the border
    addi $t5, $t5, -128 # go up a row
    b outer_loop_random
    outer_loop_random_done:
    li $t3, 0 # reset t3 
    li $t4, 0 # reset t4
    jr $ra 
    
# checks for completed lines 
# also checks if game over condition has been reached
check_completed_lines_updated:
    # first, check if the current piece's Y value is 20, if so game over
    li $t1, 6 # load 6 into t1
    la $t2, CURR_PIECE_XY # load address of x and y of current piece into t2
    lw $t3, 4($t2) # get y value of current piece
    beq $t1, $t3, game_over # if the y value is 6, game over
    li $t1, 20 # number of iterations that the outer loop will go through
    li $t2, 10 # number of iterations that the inner loop will go through
    li $t3, 0 # outer loop variable
    li $t4, 0 # inner loop variable
    add $t5, $t0, $zero # put the bitmap display address into t5
    addi $t5, $t5, 3200 # move t5 to the bottom row of the border
    addi $t5, $t5, 44 # get inside the border
    li $t6, 0x000000 # load black into t6
    
    outer_loop_check_line:
    beq $t1, $t3, outer_loop_check_line_done # if we've checked all 20 lines, loop is done
    inner_loop_check_line:
    beq $t2, $t4, completed_line # if t4 is 10
    lw $t7, 0($t5) # load the colour in t5 into t7
    beq $t7, $t6, up_line # if t7 is equal to black, move onto next line
    addi $t5, $t5, 4 # move t5 along by 4 to get to the next pixel
    addi $t4, $t4, 1 # increment t4 by 1
    b inner_loop_check_line # line could potentially be completed
    completed_line:
    li $t4, 0 # reset t4
    addi $t5, $t5, -40 # go back to the leftmost pixel in the border
    # move every line above down
    sw $t5, 0($sp) # add t5 to the stack
    sw $t3, 4($sp) # add current loop variable to the stack
    completed_line_outer_loop:
    beq $t3, 20, completed_line_outer_loop_done # if we've moved down all the lines, loop is done
    addi $t7, $t5, -128 # in t7, store the starting address for the row above the current one
    completed_line_inner_loop:
    beq $t4, $t2, completed_line_inner_loop_done # once t4 reaches 10, loop is done
    lw $t8, 0($t7) # load whats directly above the pixel in t5
    sw $t8, 0($t5) # store pixel directly above in t5
    addi $t5, $t5, 4 # move to next pixel in the row
    addi $t7, $t7, 4 # move to next pixel in above row
    addi $t4, $t4, 1 # increment loop variable by 1
    b completed_line_inner_loop
    completed_line_inner_loop_done:
    addi $t5, $t5, -40 # move back to leftmost pixel of current row
    addi $t7, $t7, -40 # move back to leftmost pixel of above row
    addi $t5, $t5, -128 # move current row up by 1
    addi $t7, $t7, -128 # move above row up by 1
    li $t4, 0 # reset t4
    addi $t3, $t3, 1 # increment outer loop variable by 1
    b completed_line_outer_loop
    completed_line_outer_loop_done:
    lw $t3, 4($sp) # get old value of t3 back
    lw $t5, 0($sp) # get old value of t5 back
    li $t4, 0 # reset t4 just in case, I'm pretty sure it should already be 0 though
    addi $s0, $s0, 1
    slt $t4, $s7, $s0
    bne $t4, $zero, update_high_score    # checks if current score is higher than high score
    j cont_completed_line_outer_loop
    update_high_score:    # replace high score with current score
    add $s7, $zero, $s0
    cont_completed_line_outer_loop:
    addi $s1, $s1, 1
    addi $t1, $zero, 10
    div $s0, $t1
    mfhi $s0    # stores the current number in the ones position
    jal erase_score # increase score by 1 and update the scoreboard
    addi $t1, $zero, 0
    beq, $s0, $t1, score_zero    # if score is multiple of ten, update both numbers on the scoreboard
    addi $t1, $t1, 1
    beq, $s0, $t1, score_one
    addi $t1, $t1, 1
    beq, $s0, $t1, score_two
    addi $t1, $t1, 1
    beq, $s0, $t1, score_three
    addi $t1, $t1, 1
    beq, $s0, $t1, score_four
    addi $t1, $t1, 1
    beq, $s0, $t1, score_five
    addi $t1, $t1, 1
    beq, $s0, $t1, score_six
    addi $t1, $t1, 1
    beq, $s0, $t1, score_seven
    addi $t1, $t1, 1
    beq, $s0, $t1, score_eight
    addi $t1, $t1, 1
    beq, $s0, $t1, score_nine
    score_one:
    jal draw_one 
    j cont_score
    score_two:
    jal draw_two
    j cont_score
    score_three:
    jal draw_three 
    j cont_score
    score_four:
    jal draw_four 
    j cont_score
    score_five:
    jal draw_five 
    j cont_score
    score_six:
    jal draw_six 
    j cont_score
    score_seven:
    jal draw_seven 
    j cont_score
    score_eight:
    jal draw_eight 
    j cont_score
    score_nine:
    jal draw_nine 
    j cont_score
    score_zero:
    jal draw_zero 
    mflo $s0    # get the number in the tens position
    addi $s3, $zero, 0  # change x position 5 pixels left
    jal erase_score
    addi $t1, $zero, 1
    beq, $s0, $t1, jump_one
    addi $t1, $zero, 2
    beq, $s0, $t1, jump_two
    addi $t1, $zero, 3
    beq, $s0, $t1, jump_three
    addi $t1, $zero, 4
    beq, $s0, $t1, jump_four
    addi $t1, $zero, 5
    beq, $s0, $t1, jump_five
    addi $t1, $zero, 6
    beq, $s0, $t1, jump_six
    addi $t1, $zero, 7
    beq, $s0, $t1, jump_seven
    addi $t1, $zero, 8
    beq, $s0, $t1, jump_eight
    addi $t1, $zero, 9
    beq, $s0, $t1, jump_nine
    jump_one:
    jal draw_one
    j get_original_zero
    jump_two:
    jal draw_two
    j get_original_zero
    jump_three:
    jal draw_three
    j get_original_zero
    jump_four:
    jal draw_four
    j get_original_zero
    jump_five:
    jal draw_five
    j get_original_zero
    jump_six:
    jal draw_six
    j get_original_zero
    jump_seven:
    jal draw_seven
    j get_original_zero
    jump_eight:
    jal draw_eight
    j get_original_zero
    jump_nine:
    jal draw_nine
    j get_original_zero
    get_original_zero:
    addi $t1, $zero, 10
    mult $s0, $t1    # get the original number
    mflo $s0
    addi $s3, $zero, 5  # return to original x position
    j cont_score_zero
    cont_score:
    mfhi $t4    # temporarily stores remainder in t4
    addi $t1, $zero, 10
    mflo $s0
    mult $s0, $t1
    mflo $s0
    add $s0, $s0, $t4   # get original score back
    addi $t4, $zero, 0  # reset t4
    cont_score_zero:    # skip previous lines if coming from score_zero since s0 has already been reset
    beq $s1, 5, increase_gravity
    li $t1, 20
    li $t2, 10
    li $t4, 0
    #addi $t1, $t1, 10
    #beq $s0, $t1, reset_score   # reset score to 0
    b inner_loop_check_line
    reset_score:
    addi $s0, $zero, 0
    b inner_loop_check_line
    increase_gravity:
    lw $t1, GRAVITY_ITERATIONS
    subi $t1, $t1, 1    # decrease number of iterations before moving piece down
    sw $t1, GRAVITY_ITERATIONS
    addi $s1, $zero, 0  # reset counter
    j cont_score_zero
    up_line:
    li $t7, 4
    mult $t4, $t7 # multiply t4 by 4, tells us how many spaces to move back
    mflo $t7 # get the first bits of t4 * 4 and put them into 7
    sub $t5, $t5, $t7 # subtract t5 by t7
    addi $t5, $t5, -128 # move up to the next line
    inner_loop_check_line_done:
    li $t4, 0 # reset inner loop variable for next loop
    addi $t3, $t3, 1 # increment outer loop variable by 1
    b outer_loop_check_line
    outer_loop_check_line_done:
    li $t3, 0 # reset t3 
    li $t4, 0 # reset t4
    la $t8, CURR_PIECE_XY
    j new_tetromino
    
game_over:
    li $t2, 1024 # number of pixels on the screen
    li $t3, 0 # loop variable
    li $t4, 0 # black
    lw $t5, ADDR_DSPL # store address of bitmap in t5
    paint_screen_black:
    beq $t2, $t3, paint_screen_black_done
    sw $t4, 0($t5) # put black into t5
    addi $t5, $t5, 4 # increment t5 by 4
    addi $t3, $t3, 1 # increment t3 by 1
    b paint_screen_black
    paint_screen_black_done:
    # draw the game over message
    li $t1, 0xffffff # game over message will be white
    first_row_go:
    # G
    sw $t1, 4($t0)
    sw $t1, 8($t0)
    sw $t1, 12($t0)
    # A
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    sw $t1, 28($t0)
    # M
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # E
    sw $t1, 52($t0)
    sw $t1, 56($t0)
    sw $t1, 60($t0)
    # O
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    # V
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # E
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    sw $t1, 108($t0)
    # R
    sw $t1, 116($t0)
    sw $t1, 120($t0)
    sw $t1, 124($t0)

    second_row_go:
    addi $t0, $t0, 128
    # G
    sw $t1, 4($t0)
    sw $t1, 12($t0)
    # A
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # M
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    sw $t1, 44($t0)
    # E
    sw $t1, 52($t0)
    # O
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # V
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # E
    sw $t1, 100($t0)
    # R
    sw $t1, 116($t0)
    sw $t1, 124($t0)

    third_row_go:
    addi $t0, $t0, 128
    # G
    sw $t1, 4($t0)
    sw $t1, 8($t0)
    sw $t1, 12($t0)
    # A
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    sw $t1, 28($t0)
    # M
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # E
    sw $t1, 52($t0)
    sw $t1, 56($t0)
    # O
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # V
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # E
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    # R
    sw $t1, 116($t0)
    sw $t1, 120($t0)

    fourth_row_go:
    addi $t0, $t0, 128
    # G
    sw $t1, 12($t0)
    # A
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # M
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # E
    sw $t1, 52($t0)
    # O
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # V
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # E
    sw $t1, 100($t0)
    # R
    sw $t1, 116($t0)
    sw $t1, 124($t0)

    fifth_row_go:
    addi $t0, $t0, 128
    # G
    sw $t1, 4($t0)
    sw $t1, 8($t0)
    sw $t1, 12($t0)
    # A
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # M
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # E
    sw $t1, 52($t0)
    sw $t1, 56($t0)
    sw $t1, 60($t0)
    # O
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    # V
    sw $t1, 88($t0)
    # E
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    sw $t1, 108($t0)
    # R
    sw $t1, 116($t0)
    sw $t1, 124($t0)

    # now, draw the retry message
    addi $t0, $t0, 128
    addi $t0, $t0, 128
    addi $t0, $t0, 128 # move down three rows

    first_row_retry:
    # R
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    sw $t1, 28($t0)
    # E
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    sw $t1, 44($t0)
    # T
    sw $t1, 52($t0)
    sw $t1, 56($t0)
    sw $t1, 60($t0)
    # R
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    # Y 
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # ?
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    sw $t1, 108($t0)

    second_row_retry:
    addi $t0, $t0, 128
    # R
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # E
    sw $t1, 36($t0)
    # T
    sw $t1, 56($t0)
    # R
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # Y 
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # ?
    sw $t1, 108($t0)

    third_row_retry:
    addi $t0, $t0, 128
    # R
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    # E
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    # T
    sw $t1, 56($t0)
    # R
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    # Y 
    sw $t1, 88($t0)
    # ?
    sw $t1, 104($t0)
    sw $t1, 108($t0)

    fourth_row_retry:
    addi $t0, $t0, 128
    # R
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # E
    sw $t1, 36($t0)
    # T
    sw $t1, 56($t0)
    # R
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # Y 
    sw $t1, 88($t0)
    # ?
    sw $t1, 104($t0)

    fifth_row_retry:
    addi $t0, $t0, 128
    # R
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # E
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    sw $t1, 44($t0)
    # T
    sw $t1, 56($t0)
    # R
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # Y 
    sw $t1, 88($t0)
    # ?
    sw $t1, 104($t0)

    addi $t0, $t0, 128

    first_row_yq:
    addi $t0, $t0, 128
    # Y
    sw $t1, 44($t0)
    sw $t1, 52($t0)
    # /
    sw $t1, 68($t0)
    # Q
    sw $t1, 76($t0)
    sw $t1, 80($t0)
    sw $t1, 84($t0)

    second_row_yq:
    addi $t0, $t0, 128
    # Y
    sw $t1, 44($t0)
    sw $t1, 52($t0)
    # /
    sw $t1, 68($t0)
    # Q
    sw $t1, 76($t0)
    sw $t1, 84($t0)

    third_row_yq:
    addi $t0, $t0, 128
    # Y
    sw $t1, 48($t0)
    # /
    sw $t1, 64($t0)
    # Q
    sw $t1, 76($t0)
    sw $t1, 84($t0)

    fourth_row_yq:
    addi $t0, $t0, 128
    # Y
    sw $t1, 48($t0)
    # /
    sw $t1, 60($t0)
    # Q
    sw $t1, 76($t0)
    sw $t1, 80($t0)

    fifth_row_yq:
    addi $t0, $t0, 128
    # Y
    sw $t1, 48($t0)
    # /
    sw $t1, 60($t0)
    # Q
    sw $t1, 84($t0)

    lw $t0, ADDR_DSPL

    game_over_loop:
    lw $t1, ADDR_KBRD
	lw $t2, 0($t1) # temporarily store whether a key has been pressed or not in $t2
	beq $t2, $zero, game_over_sleep # if nothing pressed, sleep
	lw $t2, 4($t1) # now, store the value of the key pressed in $t2 
	beq $t2, 'y', retry # if they press y, restart the game
	beq $t2, 'q', game_over_quit
	game_over_sleep:
	li $v0, 32 # want to invoke the sleep syscall
    lw $a0, SLEEP_LENGTH # update screen every half second, could be adjusted if we want
    syscall
    b game_over_loop
    game_over_quit:
    li $v0, 10
    syscall # quit the game
	retry:
	# erase the game over message
    li $t1, 0 # game over message will be white
    first_row_go:
    # G
    sw $t1, 4($t0)
    sw $t1, 8($t0)
    sw $t1, 12($t0)
    # A
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    sw $t1, 28($t0)
    # M
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # E
    sw $t1, 52($t0)
    sw $t1, 56($t0)
    sw $t1, 60($t0)
    # O
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    # V
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # E
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    sw $t1, 108($t0)
    # R
    sw $t1, 116($t0)
    sw $t1, 120($t0)
    sw $t1, 124($t0)

    second_row_go:
    addi $t0, $t0, 128
    # G
    sw $t1, 4($t0)
    sw $t1, 12($t0)
    # A
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # M
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    sw $t1, 44($t0)
    # E
    sw $t1, 52($t0)
    # O
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # V
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # E
    sw $t1, 100($t0)
    # R
    sw $t1, 116($t0)
    sw $t1, 124($t0)

    third_row_go:
    addi $t0, $t0, 128
    # G
    sw $t1, 4($t0)
    sw $t1, 8($t0)
    sw $t1, 12($t0)
    # A
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    sw $t1, 28($t0)
    # M
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # E
    sw $t1, 52($t0)
    sw $t1, 56($t0)
    # O
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # V
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # E
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    # R
    sw $t1, 116($t0)
    sw $t1, 120($t0)

    fourth_row_go:
    addi $t0, $t0, 128
    # G
    sw $t1, 12($t0)
    # A
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # M
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # E
    sw $t1, 52($t0)
    # O
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # V
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # E
    sw $t1, 100($t0)
    # R
    sw $t1, 116($t0)
    sw $t1, 124($t0)

    fifth_row_go:
    addi $t0, $t0, 128
    # G
    sw $t1, 4($t0)
    sw $t1, 8($t0)
    sw $t1, 12($t0)
    # A
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # M
    sw $t1, 36($t0)
    sw $t1, 44($t0)
    # E
    sw $t1, 52($t0)
    sw $t1, 56($t0)
    sw $t1, 60($t0)
    # O
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    # V
    sw $t1, 88($t0)
    # E
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    sw $t1, 108($t0)
    # R
    sw $t1, 116($t0)
    sw $t1, 124($t0)

    # now, draw the retry message
    addi $t0, $t0, 128
    addi $t0, $t0, 128
    addi $t0, $t0, 128 # move down three rows

    first_row_retry:
    # R
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    sw $t1, 28($t0)
    # E
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    sw $t1, 44($t0)
    # T
    sw $t1, 52($t0)
    sw $t1, 56($t0)
    sw $t1, 60($t0)
    # R
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    sw $t1, 76($t0)
    # Y 
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # ?
    sw $t1, 100($t0)
    sw $t1, 104($t0)
    sw $t1, 108($t0)

    second_row_retry:
    addi $t0, $t0, 128
    # R
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # E
    sw $t1, 36($t0)
    # T
    sw $t1, 56($t0)
    # R
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # Y 
    sw $t1, 84($t0)
    sw $t1, 92($t0)
    # ?
    sw $t1, 108($t0)

    third_row_retry:
    addi $t0, $t0, 128
    # R
    sw $t1, 20($t0)
    sw $t1, 24($t0)
    # E
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    # T
    sw $t1, 56($t0)
    # R
    sw $t1, 68($t0)
    sw $t1, 72($t0)
    # Y 
    sw $t1, 88($t0)
    # ?
    sw $t1, 104($t0)
    sw $t1, 108($t0)

    fourth_row_retry:
    addi $t0, $t0, 128
    # R
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # E
    sw $t1, 36($t0)
    # T
    sw $t1, 56($t0)
    # R
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # Y 
    sw $t1, 88($t0)
    # ?
    sw $t1, 104($t0)

    fifth_row_retry:
    addi $t0, $t0, 128
    # R
    sw $t1, 20($t0)
    sw $t1, 28($t0)
    # E
    sw $t1, 36($t0)
    sw $t1, 40($t0)
    sw $t1, 44($t0)
    # T
    sw $t1, 56($t0)
    # R
    sw $t1, 68($t0)
    sw $t1, 76($t0)
    # Y 
    sw $t1, 88($t0)
    # ?
    sw $t1, 104($t0)

    addi $t0, $t0, 128

    first_row_yq:
    addi $t0, $t0, 128
    # Y
    sw $t1, 44($t0)
    sw $t1, 52($t0)
    # /
    sw $t1, 68($t0)
    # Q
    sw $t1, 76($t0)
    sw $t1, 80($t0)
    sw $t1, 84($t0)

    second_row_yq:
    addi $t0, $t0, 128
    # Y
    sw $t1, 44($t0)
    sw $t1, 52($t0)
    # /
    sw $t1, 68($t0)
    # Q
    sw $t1, 76($t0)
    sw $t1, 84($t0)

    third_row_yq:
    addi $t0, $t0, 128
    # Y
    sw $t1, 48($t0)
    # /
    sw $t1, 64($t0)
    # Q
    sw $t1, 76($t0)
    sw $t1, 84($t0)

    fourth_row_yq:
    addi $t0, $t0, 128
    # Y
    sw $t1, 48($t0)
    # /
    sw $t1, 60($t0)
    # Q
    sw $t1, 76($t0)
    sw $t1, 80($t0)

    fifth_row_yq:
    addi $t0, $t0, 128
    # Y
    sw $t1, 48($t0)
    # /
    sw $t1, 60($t0)
    # Q
    sw $t1, 84($t0)
    
    draw_high_score:
    addi $t0, $zero, 0x10008000 # reset first pixel location
    addi $s3, $zero, 29 # set x position of high score
    addi $t1, $zero, 10
    div $s7, $t1
    mfhi $s0    # stores the digit of high score in the ones position
    jal erase_score # erase current high score in the ones digit
    addi $t1, $zero, 0
    beq, $s0, $t1, score_zero_high_ones
    addi $t1, $t1, 1
    beq, $s0, $t1, score_one_high_ones
    addi $t1, $t1, 1
    beq, $s0, $t1, score_two_high_ones
    addi $t1, $t1, 1
    beq, $s0, $t1, score_three_high_ones
    addi $t1, $t1, 1
    beq, $s0, $t1, score_four_high_ones
    addi $t1, $t1, 1
    beq, $s0, $t1, score_five_high_ones
    addi $t1, $t1, 1
    beq, $s0, $t1, score_six_high_ones
    addi $t1, $t1, 1
    beq, $s0, $t1, score_seven_high_ones
    addi $t1, $t1, 1
    beq, $s0, $t1, score_eight_high_ones
    addi $t1, $t1, 1
    beq, $s0, $t1, score_nine_high_ones
    score_zero_high_ones:
    jal draw_zero
    j cont_draw_high
    score_one_high_ones:
    jal draw_one 
    j cont_draw_high
    score_two_high_ones:
    jal draw_two
    j cont_draw_high
    score_three_high_ones:
    jal draw_three
    j cont_draw_high
    score_four_high_ones:
    jal draw_four 
    j cont_draw_high
    score_five_high_ones:
    jal draw_five 
    j cont_draw_high
    score_six_high_ones:
    jal draw_six 
    j cont_draw_high
    score_seven_high_ones:
    jal draw_seven 
    j cont_draw_high
    score_eight_high_ones:
    jal draw_eight 
    j cont_draw_high
    score_nine_high_ones:
    jal draw_nine 
    j cont_draw_high
    cont_draw_high:
    addi $s3, $zero, 24 # set x position of high score
    addi $t1, $zero, 10
    div $s7, $t1
    mflo $s0    # stores the digit of high score in the tens position
    jal erase_score # erase current high score in the ones digitaddi $t1, $zero, 0
    addi $t1, $zero, 0
    beq, $s0, $t1, score_zero_high_tens
    addi $t1, $t1, 1
    beq, $s0, $t1, score_one_high_tens
    addi $t1, $t1, 1
    beq, $s0, $t1, score_two_high_tens
    addi $t1, $t1, 1
    beq, $s0, $t1, score_three_high_tens
    addi $t1, $t1, 1
    beq, $s0, $t1, score_four_high_tens
    addi $t1, $t1, 1
    beq, $s0, $t1, score_five_high_tens
    addi $t1, $t1, 1
    beq, $s0, $t1, score_six_high_tens
    addi $t1, $t1, 1
    beq, $s0, $t1, score_seven_high_tens
    addi $t1, $t1, 1
    beq, $s0, $t1, score_eight_high_tens
    addi $t1, $t1, 1
    beq, $s0, $t1, score_nine_high_tens
    score_zero_high_tens:
    jal draw_zero
    j cont_draw_end
    score_one_high_tens:
    jal draw_one 
    j cont_draw_end
    score_two_high_tens:
    jal draw_two
    j cont_draw_end
    score_three_high_tens:
    jal draw_new
    j cont_draw_end
    score_four_high_tens:
    jal draw_four 
    j cont_draw_end
    score_five_high_tens:
    jal draw_five 
    j cont_draw_end
    score_six_high_tens:
    jal draw_six 
    j cont_draw_end
    score_seven_high_tens:
    jal draw_seven 
    j cont_draw_end
    score_eight_high_tens:
    jal draw_eight 
    j cont_draw_end
    score_nine_high_tens:
    jal draw_nine 
    j cont_draw_end
    cont_draw_end:
    lw $t0, ADDR_DSPL
    b main # go back into the game loop
