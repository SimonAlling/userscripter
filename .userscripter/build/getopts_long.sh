#!/usr/bin/env bash

#
# getopts_long -- POSIX shell getopts with GNU-style long option support
#
# Copyright 2005-2009 Stephane Chazelas <stephane_chazelas@yahoo.fr>
#
# Permission to use, copy, modify, distribute, and sell this software and
# its documentation for any purpose is hereby granted without fee, provided
# that the above copyright notice appear in all copies and that both that
# copyright notice and this permission notice appear in supporting
# documentation.  No representations are made about the suitability of this
# software for any purpose.  It is provided "as is" without express or
# implied warranty.
#
# Source: http://stchaz.free.fr/getopts_long
#
# See also: https://gist.github.com/rtfpessoa/867ac97c7795dcc647063245d27dd88c
#

getopts_long() {
  [ -n "${ZSH_VERSION+z}" ] && emulate -L sh

  unset OPTLERR OPTLARG || :

  case "$OPTLIND" in
    "" | 0 | *[!0-9]*)
      # First time in the loop. Initialise the parameters.
      OPTLIND=1
      OPTLPENDING=
      ;;
  esac

  if [ "$#" -lt 2 ]; then
    printf >&2 'getopts_long: not enough arguments\n'
    return 1
  fi

  # validate variable name. Need to fix locale for character ranges.
  LC_ALL=C command eval '
    case "$2" in
      *[!a-zA-Z_0-9]*|""|[0-9]*)
	printf >&2 "getopts_long: invalid variable name: \`%s'\''\n" "$2"
	return 1
	;;
    esac'

  # validate short option specification
  case "$1" in
    ::*|*:::*|*-*)
      printf >&2 "getopts_long: invalid option specification: \`%s'\n" "$1"
      return 1
      ;;
  esac

  # validate long option specifications

  # POSIX shells only have $1, $2... as local variables, hence the
  # extensive use of "set" in that function.

  set 4 "$@"
  while :; do
    if
      [ "$1" -gt "$#" ] || {
	eval 'set -- "${'"$1"'}" "$@"'
	[ -n "$1" ] || break
	[ "$(($2 + 2))" -gt "$#" ]
      }
    then
      printf >&2 "getopts_long: long option specifications must end in an empty argument\n"
      return 1
    fi
    eval 'set -- "${'"$(($2 + 2))"'}" "$@"'
    # $1 = type, $2 = name, $3 = $@
    case "$2" in
      *=*)
	printf >&2 "getopts_long: invalid long option name: \`%s'\n" "$2"
	return 1
	;;
    esac
    case "$1" in
      0 | no_argument) ;;
      1 | required_argument) ;;
      2 | optional_argument) ;;
      *)
	printf >&2 "getopts_long: invalid long option type: \`%s'\n" "$1"
	return 1
	;;
    esac
    eval "shift 3; set $(($3 + 2))"' "$@"'
  done
  shift

  eval "shift; set $(($1 + $OPTLIND))"' "$@"'

  # unless there are pending short options to be processed (in
  # $OPTLPENDING), the current option is now in ${$1}

  if [ -z "$OPTLPENDING" ]; then
    [ "$1" -le "$#" ] || return 1
    eval 'set -- "${'"$1"'}" "$@"'

    case "$1" in
      --)
        OPTLIND=$(($OPTLIND + 1))
	return 1
	;;
      --*)
        OPTLIND=$(($OPTLIND + 1))
        ;;
      -?*)
        OPTLPENDING="${1#-}"
	shift
	;;
      *)
        return 1
	;;
    esac
  fi

  if [ -n "$OPTLPENDING" ]; then
    # WA for zsh and bash 2.03 bugs:
    OPTLARG=${OPTLPENDING%"${OPTLPENDING#?}"}
    set -- "$OPTLARG" "$@"
    OPTLPENDING="${OPTLPENDING#?}"
    unset OPTLARG

    # $1 = current option = ${$2+1}, $3 = $@

    [ -n "$OPTLPENDING" ] ||
      OPTLIND=$(($OPTLIND + 1))

    case "$1" in
      [-:])
	OPTLERR="bad option: \`-$1'"
	case "$3" in
	  :*)
	    eval "$4=:"
	    OPTLARG="$1"
	    ;;
	  *)
	    printf >&2 '%s\n' "$OPTLERR"
	    eval "$4='?'"
	    ;;
	esac
	;;

      *)
	case "$3" in
	  *"$1"::*) # optional argument
	    eval "$4=\"\$1\""
	    if [ -n "$OPTLPENDING" ]; then
	      # take the argument from $OPTLPENDING if any
	      OPTLARG="$OPTLPENDING"
	      OPTLPENDING=
	      OPTLIND=$(($OPTLIND + 1))
	    fi
	    ;;

	  *"$1":*) # required argument
	    if [ -n "$OPTLPENDING" ]; then
	      # take the argument from $OPTLPENDING if any
	      OPTLARG="$OPTLPENDING"
	      eval "$4=\"\$1\""
	      OPTLPENDING=
	      OPTLIND=$(($OPTLIND + 1))
	    else
	      # take the argument from the next argument
	      if [ "$(($2 + 2))" -gt "$#" ]; then
		OPTLERR="option \`-$1' requires an argument"
		case "$3" in
		  :*)
		    eval "$4=:"
		    OPTLARG="$1"
		    ;;
		  *)
		    printf >&2 '%s\n' "$OPTLERR"
		    eval "$4='?'"
		    ;;
		esac
	      else
		OPTLIND=$(($OPTLIND + 1))
		eval "OPTLARG=\"\${$(($2 + 2))}\""
		eval "$4=\"\$1\""
	      fi
	    fi
	    ;;

	  *"$1"*) # no argument
	    eval "$4=\"\$1\""
	    ;;
	  *)
	    OPTLERR="bad option: \`-$1'"
	    case "$3" in
	      :*)
		eval "$4=:"
		OPTLARG="$1"
		;;
	      *)
		printf >&2 '%s\n' "$OPTLERR"
		eval "$4='?'"
		;;
	    esac
	    ;;
	esac
	;;
    esac
  else # long option

    # remove the leading "--"
    OPTLPENDING="$1"
    shift
    set 6 "${OPTLPENDING#--}" "$@"
    OPTLPENDING=

    while
      eval 'set -- "${'"$1"'}" "$@"'
      [ -n "$1" ]
    do
      # $1 = option name = ${$2+1}, $3 => given option = ${$4+3}, $5 = $@

      case "${3%%=*}" in
	"$1")
	  OPTLPENDING=EXACT
	  break;;
      esac

      # try to see if the current option can be seen as an abbreviation.
      case "$1" in
	"${3%%=*}"*)
	  if [ -n "$OPTLPENDING" ]; then
	    [ "$OPTLPENDING" = AMBIGUOUS ] || eval '[ "${'"$(($OPTLPENDING + 1))"'}" = "$1" ]' ||
	      OPTLPENDING=AMBIGUOUS
	      # there was another different option matching the current
	      # option. The eval thing is in case one option is provided
	      # twice in the specifications which is OK as per the
	      # documentation above
	  else
	    OPTLPENDING="$2"
	  fi
	  ;;
      esac
      eval "shift 2; set $(($2 + 2)) "'"$@"'
    done

    case "$OPTLPENDING" in
      AMBIGUOUS)
	OPTLERR="option \`--${3%%=*}' is ambiguous"
	case "$5" in
	  :*)
	    eval "$6=:"
	    OPTLARG="${3%%=*}"
	    ;;
	  *)
	    printf >&2 '%s\n' "$OPTLERR"
	    eval "$6='?'"
	    ;;
	esac
	OPTLPENDING=
	return 0
	;;
      EXACT)
        eval 'set "${'"$(($2 + 2))"'}" "$@"'
	;;
      "")
	OPTLERR="bad option: \`--${3%%=*}'"
	case "$5" in
	  :*)
	    eval "$6=:"
	    OPTLARG="${3%%=*}"
	    ;;
	  *)
	    printf >&2 '%s\n' "$OPTLERR"
	    eval "$6='?'"
	    ;;
	esac
	OPTLPENDING=
	return 0
	;;
      *)
        # we've got an abbreviated long option.
	shift
        eval 'set "${'"$(($OPTLPENDING + 1))"'}" "${'"$OPTLPENDING"'}" "$@"'
	;;
    esac

    OPTLPENDING=

    # $1 = option type, $2 = option name, $3 unused,
    # $4 = given option = ${$5+4}, $6 = $@

    case "$4" in
      *=*)
	case "$1" in
	  1 | required_argument | 2 | optional_argument)
	    eval "$7=\"\$2\""
	    OPTLARG="${4#*=}"
	    ;;
	  *)
	    OPTLERR="option \`--$2' doesn't allow an argument"
	    case "$6" in
	      :*)
		eval "$7=:"
		OPTLARG="$2"
		;;
	      *)
		printf >&2 '%s\n' "$OPTLERR"
		eval "$7='?'"
		;;
	    esac
	    ;;
	esac
	;;

      *)
        case "$1" in
	  1 | required_argument)
	    if [ "$(($5 + 5))" -gt "$#" ]; then
	      OPTLERR="option \`--$2' requires an argument"
	      case "$6" in
		:*)
		  eval "$7=:"
		  OPTLARG="$2"
		  ;;
		*)
		  printf >&2 '%s\n' "$OPTLERR"
		  eval "$7='?'"
		  ;;
	      esac
	    else
	      OPTLIND=$(($OPTLIND + 1))
	      eval "OPTLARG=\"\${$(($5 + 5))}\""
	      eval "$7=\"\$2\""
	    fi
	    ;;
	  *)
	    # optional argument (but obviously not provided) or no
	    # argument
	    eval "$7=\"\$2\""
	    ;;
	esac
	;;
    esac
  fi
  return 0
}
