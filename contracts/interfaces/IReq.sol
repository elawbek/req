// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IReq {
  struct User {
    address user;
    uint256 amount;
  }

  /** EVENTS */
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );

  event UserAdded(address indexed token, address user, uint256 amount);
  event Withdraw(address indexed token, uint256 amount);

  event MasterAddressChanged(address indexed masterAddress, bool status);

  /** ERRORS */
  error NewUserDidNotProvideApprove(address token);

  error MasterAddressAlreadyRegistered();
  error MasterAddressIsNotRegistered();

  error CallerIsNotTheOwner(address caller);
  error CallerIsNotTheMasterAddress(address caller);
  error NewOwnerIsTheZeroAddress();

  error WithdrawEtherFail();
}
